'use server';

import { defaultLocale, isValidLocale, localeCookieName } from '@/i18n/config';
import { prisma } from '@/prisma/client';
import { hashPassword } from '@/utils/crypto';
import { createAndVerifyTransporter } from '@/utils/email';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { createResetFormSchema, FormState, getResetMessages } from './definitions';

async function getCurrentLocale() {
  try {
    const cookieStore = await cookies();
    const requestedLocale = cookieStore.get(localeCookieName)?.value;

    if (requestedLocale && isValidLocale(requestedLocale)) {
      return requestedLocale;
    }
  } catch {
    // Fallback for tests or non-request contexts.
  }

  return defaultLocale;
}

export async function reset(state: FormState, formData: FormData) {
  const locale = await getCurrentLocale();
  const messages = getResetMessages(locale);
  const result = createResetFormSchema(locale).safeParse({
    email: formData.get('email'),
  });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const record = await prisma.user.findFirst({
      where: { email: result.data.email },
      select: { id: true, email: true, encryptionEnabled: true },
    });

    if (!record) {
      return {
        message: messages.notRegistered,
      };
    }

    // Create a transporter object using the default SMTP transport.
    // Expecting error if SMTPTransport is not well configured.
    const transporter = await createAndVerifyTransporter();

    const newPassword = randomBytes(8).toString('hex');
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: record.id },
      data: { password: hashedPassword },
    });

    // If encryption was enabled, the derived key is now unrecoverable.
    // Mark data as locked so the recovery flow is shown on next login.
    if (record.encryptionEnabled) {
      await prisma.user.update({
        where: { id: record.id },
        data: { encryptedDataLocked: true },
      });
      await prisma.session.deleteMany({ where: { userId: record.id } });
    }

    const encryptionNotice = record.encryptionEnabled
      ? '\n\nIMPORTANT: Your account had field encryption enabled. Your encrypted data is now locked. Log in with the new password and go to your profile to recover or wipe the encrypted data using your old password.'
      : '';

    const info = await transporter.sendMail({
      from: `"${'daylog'} accounts" <${process.env.SMTP_SERVER_USER}>`,
      to: record.email,
      subject: messages.emailSubject,
      text: messages.emailBody.replace('{password}', newPassword) + encryptionNotice,
    });
    return {
      success: info.messageId ? true : false,
    };
  } catch (e) {
    console.error(e);
    return {
      message: messages.unexpectedError,
    };
  }
}