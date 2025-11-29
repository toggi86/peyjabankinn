from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to view/edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read/write permissions only to the owner
        return obj.user == request.user
