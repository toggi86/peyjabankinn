from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils import timezone

class IsOwner(BasePermission):
    """
    Custom permission to only allow owners of an object to view/edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read/write permissions only to the owner
        return obj.user == request.user


class IsStaffOrReadOnly(BasePermission):
    """
    Custom permission:
    - Allow read-only requests for everyone.
    - Allow write requests only for staff users.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class BeforeObjectDatePermission(BasePermission):
    """
    Allows SAFE_METHODS always.
    Blocks write methods if obj.lock_datetime has passed.
    """

    message = "The game or competition has already started."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        # Expect the model to expose a datetime to check
        lock_dt = getattr(obj, "lock_datetime", None)

        if lock_dt is None:
            return True  # fail open if not configured

        return timezone.now() < lock_dt
