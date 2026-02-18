from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from workorders.models import Event

COLORS = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#bcbd22", "#17becf",
]
COMPLETED_COLOR = "#6c757d"


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendar_events(request):
    """Return all scheduled events as calendar-compatible JSON"""
    events = Event.objects.filter(
        date__isnull=False
    ).select_related('work_order__client').order_by('date', 'daily_order', 'scheduled_time')

    data = []
    for event in events:
        wo = event.work_order
        is_completed = event.completed or wo.status == 'completed'

        daily_prefix = f"{event.daily_order}. " if event.daily_order else ""
        title = f"{daily_prefix}{event.get_event_type_display()} - {wo.client.name}"

        color = COMPLETED_COLOR if is_completed else COLORS[wo.id % len(COLORS)]

        data.append({
            'id': f"event_{event.id}",
            'title': title,
            'start': event.date.isoformat(),
            'color': color,
            'workOrderId': wo.id,
            'dailyOrder': event.daily_order,
            'isEventCompleted': event.completed,
            'isWorkOrderCompleted': wo.status == 'completed',
            'isCompleted': is_completed,
        })

    return Response(data)
