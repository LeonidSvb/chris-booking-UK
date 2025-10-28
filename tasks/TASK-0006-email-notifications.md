---
description: Implement email notification system for bookings and confirmations
globs: "bofe_react/src/**/*.{js,jsx}"
alwaysApply: false
---

id: "TASK-0006"
title: "Implement Email Notification System"
status: "planned"
priority: "P2"
labels: ["feature", "backend", "communication"]
dependencies: []
created: "2025-10-28"

# 1) High-Level Objective

Add comprehensive email notification system for booking confirmations, payment receipts, owner notifications, and booking reminders to improve communication and user trust.

# 2) Background / Context

From PRD "Nice-to-have (Later)" section. Currently, no automated emails are sent. Email notifications will:
- Confirm bookings immediately
- Send payment receipts
- Notify owners of new bookings
- Send pre-arrival reminders
- Improve customer confidence and reduce support queries

# 3) Assumptions & Constraints

- ASSUMPTION: Backend will handle email sending (not frontend)
- Constraint: Use SendGrid or similar service for email delivery
- Constraint: Must comply with GDPR and email marketing regulations
- ASSUMPTION: Email templates stored in backend
- Constraint: Frontend only triggers email via API calls

# 4) Dependencies (Other Tasks or Artifacts)

- Backend API must implement email service
- Email service provider account (SendGrid, Mailgun, etc.)
- Email templates must be designed and approved

# 5) Context Plan

**Beginning (add to model context):**

- bofe_react/src/services/bookingService.js
- bofe_react/src/pages/Properties/BookingForm.jsx (if exists)
- Backend email service (external)

**End state (must exist after completion):**

- bofe_react/src/services/emailService.js (new - API wrapper)
- bofe_react/src/components/booking/EmailPreferences.jsx (new)
- Backend email endpoints implemented
- Email templates created

# 6) Low-Level Steps

1. **Create email service API wrapper (Frontend)**

   - File: `bofe_react/src/services/emailService.js`
   - Exported API:
     ```js
     import api from './api';

     export const emailService = {
       async sendBookingConfirmation(bookingId) {
         const response = await api.post(`/emails/booking-confirmation`, {
           bookingId,
         });
         return response.data;
       },

       async sendPaymentReceipt(paymentId) {
         const response = await api.post(`/emails/payment-receipt`, {
           paymentId,
         });
         return response.data;
       },

       async sendOwnerNotification(bookingId, ownerId) {
         const response = await api.post(`/emails/owner-notification`, {
           bookingId,
           ownerId,
         });
         return response.data;
       },

       async sendBookingReminder(bookingId) {
         const response = await api.post(`/emails/booking-reminder`, {
           bookingId,
         });
         return response.data;
       },

       async sendCancellationConfirmation(bookingId) {
         const response = await api.post(`/emails/cancellation`, {
           bookingId,
         });
         return response.data;
       },
     };
     ```

2. **Create EmailPreferences component**

   - File: `bofe_react/src/components/booking/EmailPreferences.jsx`
   - Exported API:
     ```jsx
     export function EmailPreferences({ preferences, onChange }) {
       return (
         <div className="bg-gray-50 rounded-lg p-4">
           <h3 className="font-semibold mb-3">Email Preferences</h3>

           <label className="flex items-center mb-2">
             <input
               type="checkbox"
               checked={preferences.bookingConfirmation}
               onChange={(e) => onChange({ ...preferences, bookingConfirmation: e.target.checked })}
               className="mr-2 h-4 w-4 text-exmoor-green"
             />
             <span className="text-sm">Booking confirmations</span>
           </label>

           <label className="flex items-center mb-2">
             <input
               type="checkbox"
               checked={preferences.paymentReceipts}
               onChange={(e) => onChange({ ...preferences, paymentReceipts: e.target.checked })}
               className="mr-2 h-4 w-4 text-exmoor-green"
             />
             <span className="text-sm">Payment receipts</span>
           </label>

           <label className="flex items-center mb-2">
             <input
               type="checkbox"
               checked={preferences.bookingReminders}
               onChange={(e) => onChange({ ...preferences, bookingReminders: e.target.checked })}
               className="mr-2 h-4 w-4 text-exmoor-green"
             />
             <span className="text-sm">Booking reminders (7 days before arrival)</span>
           </label>

           <label className="flex items-center">
             <input
               type="checkbox"
               checked={preferences.promotionalEmails}
               onChange={(e) => onChange({ ...preferences, promotionalEmails: e.target.checked })}
               className="mr-2 h-4 w-4 text-exmoor-green"
             />
             <span className="text-sm">Promotional offers (optional)</span>
           </label>

           <p className="text-xs text-gray-500 mt-3">
             You can update these preferences anytime in your account settings.
           </p>
         </div>
       );
     }
     ```

3. **Trigger booking confirmation email after successful booking**

   - File: `bofe_react/src/pages/Properties/BookingForm.jsx` (or checkout page)
   - Trigger email on booking success:
     ```jsx
     import { emailService } from '../../services/emailService';

     function BookingForm() {
       const { mutate: createBooking } = useMutation({
         mutationFn: bookingService.create,
         onSuccess: async (booking) => {
           // Send booking confirmation email
           try {
             await emailService.sendBookingConfirmation(booking.id);
             // Also notify owner
             await emailService.sendOwnerNotification(booking.id, booking.ownerId);
           } catch (error) {
             console.error('Failed to send email notifications:', error);
             // Don't fail booking if email fails
           }

           // Redirect to confirmation page
           navigate(`/booking/confirmation/${booking.id}`);
         },
       });

       // ... rest of component
     }
     ```

4. **Backend: Create email service (CakePHP)**

   - File: `stage_exmoor/src/Service/EmailService.php`
   - Implement SendGrid integration:
     ```php
     <?php
     namespace App\Service;

     use SendGrid\Mail\Mail;

     class EmailService
     {
         private $sendgrid;

         public function __construct()
         {
             $apiKey = env('SENDGRID_API_KEY');
             $this->sendgrid = new \SendGrid($apiKey);
         }

         public function sendBookingConfirmation($booking, $user)
         {
             $email = new Mail();
             $email->setFrom("bookings@bestofexmoor.co.uk", "Best of Exmoor");
             $email->setSubject("Booking Confirmation - {$booking->property->name}");
             $email->addTo($user->email, $user->name);

             $templateData = [
                 'booking_id' => $booking->id,
                 'property_name' => $booking->property->name,
                 'check_in' => $booking->check_in->format('d/m/Y'),
                 'check_out' => $booking->check_out->format('d/m/Y'),
                 'total_price' => '£' . number_format($booking->total_price, 2),
                 'guest_name' => $user->name,
             ];

             $email->addDynamicTemplateData($templateData);
             $email->setTemplateId(env('SENDGRID_BOOKING_TEMPLATE_ID'));

             try {
                 $response = $this->sendgrid->send($email);
                 return $response->statusCode() === 202;
             } catch (\Exception $e) {
                 Log::error('Email sending failed: ' . $e->getMessage());
                 return false;
             }
         }

         // Similar methods for other email types...
     }
     ```

5. **Backend: Create email controller endpoints**

   - File: `stage_exmoor/src/Controller/EmailsController.php`
   - Add endpoints:
     ```php
     <?php
     namespace App\Controller;

     class EmailsController extends AppController
     {
         public function bookingConfirmation()
         {
             $this->request->allowMethod(['post']);
             $bookingId = $this->request->getData('bookingId');

             $booking = $this->Bookings->get($bookingId, [
                 'contain' => ['Properties', 'Users']
             ]);

             $emailService = new EmailService();
             $success = $emailService->sendBookingConfirmation($booking, $booking->user);

             return $this->response->withType('application/json')
                 ->withStringBody(json_encode([
                     'success' => $success,
                     'message' => $success ? 'Email sent' : 'Email failed'
                 ]));
         }

         // Similar endpoints for other email types...
     }
     ```

6. **Create email templates (SendGrid)**

   - Use SendGrid Dynamic Templates
   - Create templates:
     - `booking-confirmation` - Booking details, dates, property info, check-in instructions
     - `payment-receipt` - Payment amount, method, booking reference
     - `owner-notification` - New booking alert for property owners
     - `booking-reminder` - 7-day pre-arrival reminder
     - `cancellation-confirmation` - Cancellation details and refund info

   - Each template should include:
     - Best of Exmoor branding
     - Clear call-to-action
     - Contact information
     - Unsubscribe link (GDPR compliance)

7. **Add email configuration to .env**

   - File: `stage_exmoor/.env`
   - Add variables:
     ```env
     SENDGRID_API_KEY=your_api_key_here
     SENDGRID_BOOKING_TEMPLATE_ID=d-xxx
     SENDGRID_PAYMENT_TEMPLATE_ID=d-yyy
     SENDGRID_OWNER_TEMPLATE_ID=d-zzz
     SENDGRID_REMINDER_TEMPLATE_ID=d-aaa
     SENDGRID_CANCELLATION_TEMPLATE_ID=d-bbb
     ```

8. **Add email queue for reliability (optional but recommended)**

   - Use CakePHP Queue plugin or database-backed queue
   - Retry failed emails
   - Handle rate limiting
   - Process emails asynchronously

# 7) Types & Interfaces

```js
// bofe_react/src/services/emailService.js
export interface EmailResponse {
  success: boolean;
  message: string;
  emailId?: string;
}

export interface EmailPreferences {
  bookingConfirmation: boolean;
  paymentReceipts: boolean;
  bookingReminders: boolean;
  promotionalEmails: boolean;
}
```

# 8) Acceptance Criteria

- Booking confirmation email sent automatically after successful booking
- Payment receipt email sent after successful payment
- Owner notification email sent when new booking is created
- Booking reminder sent 7 days before check-in
- All emails use professional SendGrid templates with branding
- Email preferences component allows users to opt-in/out
- Failed emails are logged and retried
- GDPR-compliant unsubscribe links in all emails
- Email service doesn't block booking flow (async)

# 9) Testing Strategy

- Integration testing: Test email sending with real SendGrid sandbox
- Test email content: Verify all dynamic data renders correctly
- Test edge cases: Failed email sending doesn't break booking flow
- Test spam filters: Ensure emails don't land in spam
- Test mobile rendering: Verify emails render well on mobile devices
- Load testing: Verify email queue handles high volume

# 10) Notes / Links

- SendGrid docs: https://docs.sendgrid.com/
- GDPR compliance: https://gdpr.eu/email-encryption/
- Email best practices: https://www.campaignmonitor.com/resources/guides/email-marketing-best-practices/
- Future: Add SMS notifications via Twilio
- Future: In-app notification center
- Related: Consider TASK-0010 for notification preferences dashboard
