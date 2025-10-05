import emailjs from '@emailjs/browser';

// EmailJS configuration
// You'll need to replace these with your actual EmailJS credentials from https://www.emailjs.com/
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

class EmailService {
  /**
   * Send verification email to user
   * @param {string} email - User's email address
   * @param {string} fullName - User's full name
   * @param {string} verificationToken - Verification token
   * @returns {Promise<Object>} Result of email send operation
   */
  async sendVerificationEmail(email, fullName, verificationToken) {
    try {
      // Check configuration
      const isConfigured = await this.testConfiguration();
      if (!isConfigured) {
        console.warn('EmailJS not configured. Verification email not sent.');
        console.log('Verification link:', `${window.location.origin}/verify-email?token=${verificationToken}`);
        return {
          success: false,
          error: 'Email service not configured. Please contact administrator.',
          configError: true
        };
      }

      const verificationLink = `${window.location.origin}/verify-email?token=${verificationToken}`;

      const templateParams = {
        to_email: email,
        to_name: fullName || 'New User',
        verification_link: verificationLink,
        verification_token: verificationToken,
        site_name: 'Wind Concert Band',
        from_name: 'Wind Concert Band Team'
      };

      console.log('Sending verification email to:', email);

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        console.log('Verification email sent successfully');
        return {
          success: true,
          message: 'Verification email sent successfully'
        };
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email service error:', error);
      console.error('Error details:', {
        message: error.message,
        text: error.text,
        status: error.status
      });
      console.error('EmailJS configuration:', {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKey: EMAILJS_PUBLIC_KEY ? 'Set' : 'Not set'
      });
      console.error('Template params sent:', {
        to_email: email,
        to_name: fullName || 'New User'
      });
      return {
        success: false,
        error: error.text || error.message || 'Failed to send verification email'
      };
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User's email address
   * @param {string} fullName - User's full name
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>} Result of email send operation
   */
  async sendPasswordResetEmail(email, fullName, resetToken) {
    try {
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

      const templateParams = {
        to_email: email,
        to_name: fullName || 'User',
        reset_link: resetLink,
        reset_token: resetToken,
        site_name: 'Wind Concert Band',
        from_name: 'Wind Concert Band Team'
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        'password_reset_template', // You'll need to create this template in EmailJS
        templateParams
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'Password reset email sent successfully'
        };
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send password reset email'
      };
    }
  }

  /**
   * Test email configuration
   * @returns {Promise<boolean>} True if configuration is valid
   */
  async testConfiguration() {
    if (
      EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
      EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' ||
      EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY'
    ) {
      console.warn('EmailJS configuration not set. Please add your EmailJS credentials to .env file.');
      return false;
    }
    return true;
  }
}

export const emailService = new EmailService();
