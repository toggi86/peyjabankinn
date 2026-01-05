from django_rest_passwordreset.signals import reset_password_token_created
from django.conf import settings
from django.core.mail import send_mail

def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    """
    Prints the reset token (link) to the console in dev.
    """
    user = reset_password_token.user
    token = reset_password_token.key

    reset_link = f"https://peyjabanki.com/reset-password/confirm?token={token}&uid={user.pk}"

    print(f"\n=== PASSWORD RESET LINK ===\nUser: {user.email}\nLink: {reset_link}\n")

    # Optional: actually use send_mail if you want console backend
    send_mail(
        subject="Password Reset for Peyjabanki",
        message=f"Hello {user.username}, use this link to reset your password:\n\n{reset_link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )

# Connect the signal
reset_password_token_created.connect(password_reset_token_created)
