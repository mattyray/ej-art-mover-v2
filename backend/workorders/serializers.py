from rest_framework import serializers
from .models import WorkOrder, Event, JobAttachment, JobNote


class EventSerializer(serializers.ModelSerializer):
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'work_order', 'event_type', 'event_type_display',
            'address', 'date', 'daily_order', 'scheduled_time',
            'completed', 'completed_at', 'completed_by',
        ]
        read_only_fields = ['completed_at', 'completed_by']


class JobAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    file_icon = serializers.CharField(source='get_file_icon', read_only=True)

    class Meta:
        model = JobAttachment
        fields = [
            'id', 'work_order', 'file', 'file_type', 'file_size',
            'file_url', 'thumbnail_url', 'file_icon', 'uploaded_at',
        ]
        read_only_fields = ['file_type', 'file_size', 'uploaded_at']

    def get_file_url(self, obj):
        return obj.get_file_url()

    def get_thumbnail_url(self, obj):
        return obj.get_thumbnail_url()


class JobNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobNote
        fields = ['id', 'work_order', 'note', 'created_at']
        read_only_fields = ['created_at']


class WorkOrderListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    event_count = serializers.SerializerMethodField()

    class Meta:
        model = WorkOrder
        fields = [
            'id', 'client', 'client_name', 'job_description',
            'estimated_cost', 'status', 'invoiced',
            'created_at', 'updated_at', 'completed_at', 'event_count',
        ]

    def get_event_count(self, obj):
        return obj.events.count()


class WorkOrderDetailSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    events = EventSerializer(many=True, read_only=True)
    attachments = JobAttachmentSerializer(many=True, read_only=True)
    notes = JobNoteSerializer(many=True, read_only=True)

    class Meta:
        model = WorkOrder
        fields = [
            'id', 'client', 'client_name', 'job_description',
            'estimated_cost', 'status', 'invoiced',
            'created_at', 'updated_at', 'completed_at',
            'events', 'attachments', 'notes',
        ]


class WorkOrderCreateUpdateSerializer(serializers.ModelSerializer):
    events = EventSerializer(many=True, required=False)

    class Meta:
        model = WorkOrder
        fields = [
            'id', 'client', 'job_description', 'estimated_cost',
            'status', 'invoiced', 'events',
        ]

    def create(self, validated_data):
        events_data = validated_data.pop('events', [])
        work_order = WorkOrder.objects.create(**validated_data)
        for event_data in events_data:
            event_data.pop('work_order', None)
            Event.objects.create(work_order=work_order, **event_data)
        work_order.update_status()
        work_order.save()
        return work_order

    def update(self, instance, validated_data):
        events_data = validated_data.pop('events', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if events_data is not None:
            event_ids = [e.get('id') for e in events_data if e.get('id')]
            instance.events.exclude(id__in=event_ids).delete()
            for event_data in events_data:
                event_data.pop('work_order', None)
                event_id = event_data.pop('id', None)
                if event_id:
                    Event.objects.filter(id=event_id, work_order=instance).update(**event_data)
                else:
                    Event.objects.create(work_order=instance, **event_data)

        instance.update_status()
        instance.save()
        return instance
