



**Event type**

An event type is a saved search that categorizes events within a data source, eliminating the need to repeatedly write complex queries. By defining field-value pairs and search terms, you can identify specific types of events and reference them by name (e.g., eventtype=cosmic_journal), simplifying searches and ensuring consistency. Because of Splunk uses schema-on-read, how event types are defined can be updated over time.

When multiple event types relate to the same category (e.g., logs from different journal systems tracking similar activities), you can assign them a common tag (e.g., tag=journal). This allows you to retrieve all relevant events in a single search (tag=journal) without manually specifying each event type.

For the use cases in this repository, each data source related to patient privacy is expected to have its own unique event type. Additionally, all event types should reference the tag 'journal' for full compatibility.  

Event types can be created via:
- Splunk Web: Settings > Event Types > New Event Type
  - If you create an event type in Splunk Web and reference a tag that does not already exist, Splunk automatically creates that tag.
- Configuration files: eventtypes.conf and tags.conf.
  - If you define event types in configuration files that references a tag, you must manually define that tag in tags.conf.
        
Each eventtype needs three pieces of information:
- A unique name
- A search string that identifies the relevant events from the specific journal system.
    - The search should reference the index, host, source, and sourcetype fields with their appropriate values.
    - Depending on the journal system, additional field-value pairs and search terms may be required to ensure precise event categorization.
- A reference to the tag 'journal'.

**fields**

      - Example:
          - If working with Cambio COSMIC events, extract the field as cosmic_staff_ID and create an alias: cosmic_staff_ID AS staff_ID.
