from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkOrderViewSet, EventViewSet, JobAttachmentViewSet, JobNoteViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'attachments', JobAttachmentViewSet, basename='attachment')
router.register(r'notes', JobNoteViewSet, basename='note')
router.register(r'', WorkOrderViewSet, basename='workorder')

urlpatterns = [
    path('', include(router.urls)),
]
