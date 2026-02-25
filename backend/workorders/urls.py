from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkOrderViewSet, EventViewSet, JobAttachmentViewSet, JobNoteViewSet, workorder_pdf

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'attachments', JobAttachmentViewSet, basename='attachment')
router.register(r'notes', JobNoteViewSet, basename='note')
router.register(r'', WorkOrderViewSet, basename='workorder')

urlpatterns = [
    path('<int:pk>/pdf/', workorder_pdf, name='workorder-pdf'),
    path('', include(router.urls)),
]
