export default {
  name: 'smsLog',
  title: 'SMS Log',
  type: 'document',
  fields: [
    {
      name: 'messageId',
      title: 'Message ID',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'phoneNumbers',
      title: 'Phone Numbers',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
    },
    {
      name: 'message',
      title: 'Message Content',
      type: 'text',
      readOnly: true,
    },
    {
      name: 'sentBy',
      title: 'Sent By',
      type: 'reference',
      to: [{ type: 'user' }],
      description: 'Admin user who initiated the SMS',
    },
    {
      name: 'sentAt',
      title: 'Sent At',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'orderId',
      title: 'Order Reference',
      type: 'reference',
      to: [{ type: 'order' }],
      weak: true,
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Sent', value: 'sent' },
          { title: 'Failed', value: 'failed' },
          { title: 'Pending', value: 'pending' },
        ],
      },
    },
    {
      name: 'failureReason',
      title: 'Failure Reason',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'message',
      subtitle: 'sentAt',
    },
    prepare(selection: any) {
      return {
        title: selection.title?.substring(0, 50) + '...',
        subtitle: selection.subtitle ? new Date(selection.subtitle).toLocaleDateString() : 'Unknown date',
      }
    },
  },
}
