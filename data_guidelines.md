



**Event type**

An event type serves the mean to categorize events within a data source, making it easier to filter and retrieve relevant events in searches. You simply define what field::value pairs and search terms that an event type should reference to narrow down the events to your liking, then you reference only that event type in a search and run it. Most likely, you will have multiple event types that include the same category of data, then instead of having to reference each and every event type one by one in the same you can have the event types tagged with the sametag, so then you can reference only that tag in a search (e.g. tag=journal) to retrieve all indexed events that hold records of journal activity despite data source.


Instead of referencing multiple event types (that fall within the same category) one by one in a search, a common denominator
  (a tag) can be referenced instead to efficiently retrieve all relevant events.
- Event types can be created via:
    - Splunk Web: Settings > Event Types > New Event Type
      - If you create an event type in Splunk Web and reference a tag that does not already exist, Splunk automatically creates that tag.
    - Configuration files: eventtypes.conf and tags.conf.
      - If you define event types in configuration files that references a tag, you must manually define that tag in tags.conf.
- Each eventtype needs three pieces of information:
    - A unique name
    - A search string that identifies the relevant events from the specific journal system.
        - The search should reference the index, host, source, and sourcetype fields with their appropriate values.
        - Depending on the journal system, additional field-value pairs and search terms may be required to ensure precise event categorization.
    - A reference to the tag 'journal'.


      - Example:
          - If working with Cambio COSMIC events, extract the field as cosmic_staff_ID and create an alias: cosmic_staff_ID AS staff_ID.
