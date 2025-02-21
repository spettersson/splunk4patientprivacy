# **Data Guide**
This data guide serves the purpose of description how to get the required data into Splunk and normalized so they can be fed into the use cases.



## **Getting Application Data Into Splunk**

Splunk can collect, index, search, correlate, and visualize any data from application, including audit logs from popular clinical applications such as Cosmic, Millenium, and EPIC.

When onboarding logs from a new application, it is crucial to provide Splunk with proper configurations to ensure that logs are correctly parsed and indexed. This process is referred to as **index-time processing**, which occurs between the moment that Splunk initiates parsing of the logs until they finally written to an index as individual events - where each event represents something that happened at a specific point in time.

To handle the wide variety of log formats — whether from different applications or variations within the same application — Splunk assigns each log format a unique **sourcetype**, ensuring that index-time processing is tailored accordingly.


### **What is a Sourcetype?**

A [sourcetype](https://docs.splunk.com/Splexicon:Sourcetype) instructs Splunk how to perform index-time processing, specifically by determining:

- How log entries are separated into individual events
- How the timestamp is identified, extracted and assigned to each individual event

### **How is a Sourcetype Created and Assigned to the Right Logs?**

#### **1. Get to know your logs**

The first step is to understand what logs each application generates, where they are stored, and in what format. When analyzing the **log formats**, it is important to consider the following:

-  Are the logs **structured** (csv, json, xml), **unstructured** (free-text), or a combination❓ 
-  Does each log entry consist of a **single line** or **multiple lines**❓ 
-  What **delimiter** separates log entries (i.e, what indicates the end and start of a new log entry)❓ 
-  What **timestamp format** is used❓

Additionally, it is essential to categorize logs appropriately. For example, an application might write logs to multiple files with the same format, but some may be associated to performance while others are related to audit.

Rule of thumb when assigning sourcetypes: 
- If two log files (e.g., F_IX_ACCESS.txt and F_IX_ACTIVITY.txt) from the same application (e.g., Cambio Cosmic) have different formats → Assign each log file a unique sourcetype.
- If two log files from the same application have the same format, but falls into two completely different log categories → Assign each log source a unique sourcetype.
- If two log files from the same application have the same format, and falls into the same log category → Assign both log sources the same sourcetype.
- If two log files from different applications have the same format → Assign each log source a unique sourcetype.

#### **2. Define How a Sourcetype Does Event Line-Breaking**

[Event line-breaking](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configureeventlinebreaking) determines how Splunk processes raw text and breaks it into individual events, ensuring that every complete log entry is indexed as a separate event.

A full list of configurations for event line-breaking with detailed explanations can be found [here](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configureeventlinebreaking#:~:text=Line%20breaking%20general,affect%20line%20breaking.). 
In many cases, the default settings are sufficient, so it’s recommended to test them first. If they don't do the job, then consider adjusting the following key settings (part of what is known as the [Splunk Great Eight](https://lantern.splunk.com/Splunk_Platform/Product_Tips/Data_Management/Configuring_new_source_types#:~:text=The%20Splunk%20Great%20Eight%0A(always%20configure%20for%20all%20source%20types))):

- `LINE_BREAKER` → Specifies a regex that determines how Splunk breaks raw text into lines. The regex must contain a capturing group, and wherever the regex matches, Splunk considers the start of the first capturing group to be the end of the previous line, and considers the end of the first capturing group to be the start of the next line. The portion of the text matched by the capturing group is excluded from the lines. Whether each line is directly processed as an individual event depends on if Splunk is instructed to try to merge lines or not (see SHOULD_LINEMERGE setting).
  - Default: LINE_BREAKER = ([\r\n]+)
- `SHOULD_LINEMERGE` → Specifies a boolean that determines whether Splunk should try to merge multiple lines into to a single event based on specific patterns. If set to false, each individual line will processed as a single event. If set to true, the default behavior is that Splunk will create a new event if it encounters a line that includes a timestamp (that is, the line with the timestamp will be part of the next event). Splunk encourages disabling line merging if you can do with just LINE_BREAKER, as it results in improved performance.
  - Default: SHOULD_LINEMERGE = true 
- `TRUNCATE` → Determines the maximum size of an event, in bytes. This prevents Splunk from indexing abnormally large events that can have negative impact on performance.
  - Default: TRUNCATE = 10000 

For example, to properly apply event line-breaking to free-text single-line logs delimited by a single \n character:  
```ini
LINE_BREAKER = ([\r\n]+)  # This is a default setting - breaks raw data into lines whenever one or more newlines are identified.
SHOULD_LINEMERGE = false # Because we are dealing with single line log entries only, line merging can be disabled.
TRUNCATE = 10000 # This is a default setting - sees to that an event cannot exceed 10,000 bytes in size. 
```

#### **3. Define How a Sourcetype Does Event Timestamp Assignment**

[Event timestamp assignment](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkextractstimestamps) determines how Splunk identifies, extracts, and assigns a timestamp to each individual event.

A full list of configurations for event timestamp assignment with detailed explanations can be found [here](https://docs.splunk.com/Documentation/Splunk/9.4.0/Data/Configuretimestamprecognition#:~:text=of%20these%20settings.-,Timestamp%20settings,The%20following%20timestamp%20configuration%20settings%20are%20available%3A,-Setting). If you do not explicitly define event timestamp assignment for your sourcetype, Splunk will attempt to assign timestamps automatically. If this process fails, Splunk will use the time the event was indexed as its timestamp. However, relying on automatic timestamp assignment carries risks, so it is strongly recommended to define custom event timestamp configurations. To do this, consider the following key settings (part of what is known as the [Splunk Great Eight](https://lantern.splunk.com/Splunk_Platform/Product_Tips/Data_Management/Configuring_new_source_types#:~:text=The%20Splunk%20Great%20Eight%0A(always%20configure%20for%20all%20source%20types))):

- `TIME_PREFIX` → A regex that identifies where the timestamp begins in an event. The timestamp is expected to follow immediately after every match.
- `TIME_FORMAT` → Defines the expected timestamp format using a strftime-style pattern.
- `MAX_TIMESTAMP_LOOKAHEAD` → Specifies how many characters Splunk should scan after TIME_PREFIX to extract the timestamp.

For example, to properly apply event timestamp assignment to free-text single-line logs with timestamps in ISO 8601 format (including microseconds):
```ini
TIME_PREFIX = ^  # A regex indicating that the timestamp is located at the beginning of each log entry.
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%6QZ  # Strptime indicating that the timestamp format follow ISO 8601 with microseconds.
MAX_TIMESTAMP_LOOKAHEAD = 27  # Indicating that the timestamp length is up to 27 characters.
```

#### **4. Validate the sourcetype**

It is recommended to always run tests to validate that each individual sourcetype works as intended before applying it to production data. This is typically done in a separate Splunk environment dedicated to testing, but it can also be done via the "Add Data" wizard in Splunk Web
1. Navigate to **Settings → Add Data** in Splunk Web.
2. Click **Upload**.
3. Click **Select File** and select a sample log file.
4. Enter **event event line-breaking** configurations (tip: first check if the default settings work).
5. Enter **event timestamp assignment** configurations.
6. Validate.

#### **5. Create a Sourcetype**

It is recommended to store a sourcetype in a Splunk [add-on](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Whatsanapp#:~:text=a%20performance%20bottleneck.-,Add%2Don,specific%20capabilities%20to%20assist%20in%20gathering%2C%20normalizing%2C%20and%20enriching%20data%20sources.,-An%20add%2Don). In simple terms, an add-on is a repository for configurations designed to assist with collecting, parsing, normalizing, and enriching data.

While it’s technically possible to store all sourcetypes for all applications from all vendors in a single add-on, best practice is to (as a bare minimum) create one add-on for each vendor. This improves manageability and makes it easier to maintain configurations. 

To create an add-on locally on your host, execute the following [bash script](https://github.com/spettersson/splunk4patientprivacy/blob/92e977ac752a40383dad873b391d34c68046172b/scripts/create_addon.sh).

Subsequently, to create a sourcetype, navigate to `<my_addon>/defaulf/props.conf` and add a stanza as shown below:

```ini
[<my_sourcetype>]
LINE_BREAKER = <regular expression>
SHOULD_LINEMERGE = <true|false>

TIME_PREFIX = <regular expression>
TIME_FORMAT = <strptime-format>
MAX_TIMESTAMP_LOOKAHEAD = <integer>
```


#### **6. Assign the Right Sourcetype to the Right Logs**

When Splunk receives logs, it needs information about which sourcetype to assign to which logs. This is typically done by the collection mechanism (e.g., [Splunk Universal Forwarder](https://docs.splunk.com/Documentation/Forwarder/latest/Forwarder/Abouttheuniversalforwarder)/[HTTP Event Collector](https://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector)) assigning sourcetype metadata which subsequently is carried over with the logs when sent to Splunk. How this assignment is done depends on the collection mechanism used, which in turn depends on how logs can be accessed from the application in question. 

A common scenario is that the application you want to collect logs from writes logs to multiple files in a human-readable format, which can then be collected by a Splunk Universal Forwarder (UF). A UF is a lightweight agent that tails log files, sending historical entries once and continuously forwarding any new log entries to Splunk. Unlike many other agents, a UF is designed to do minimal processing, focusing solely on reading log files and sending them unaltered to Splunk. 

The UF needs instructions for what directory or files to monitor and what metadata to add to those logs (e.g., which sourcetype to assign, and in what Splunk [index](https://docs.splunk.com/Splexicon:Index) to store the logs). This is defined in the configuration file [inputs.conf](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf). If you are collecting logs from e.g., Cambio Cosmic, navigate to `<my_addon>/default/inputs.conf` and add one stanza per sourcetype. If you’ve already mapped out which log file should be assigned which sourcetype, this step is straightforward. 

Example monitor stanza:
```ini
[monitor://<path>]
index = <my_index>
sourcetype = <my_sourcetype>
```


---


## **Normalization of Application Data**


### Introduction
By now, you’ve likely realized that getting application data into Splunk is easy because you don’t need to do the work of defining a schema upfront (known as schema-on-write). You simply index all log entries as events in their nearly original format with minimal configuration.

Splunk dynamically applies a schema to events when a search is run—a concept known as schema-on-read. Essentially, this means that Splunk extracts fields from events at the moment a search is executed, whether manually or as a scheduled background process. Fields can be extracted using standardized names (and standardized values when applicable), effectively normalizing the data. As a result, filtering, correlating, and analyzing events across vendors and applications becomes seamless.

To get the data normalized, Splunk primarily relies on two main [knowledge object types](https://docs.splunk.com/Splexicon:Knowledgeobject):
- [Field extractions](https://docs.splunk.com/Splexicon:Fieldextraction)
- [Field aliases](https://docs.splunk.com/Splexicon:Alias)

### What is a Field extraction?

A field extraction is the process of Splunk extracting values matching a specific pattern within events and mapping them to a defined field name. This results in field::value pairs, which can be referenced in searches for filtering, correlating, and analyzing events. 

For example, you might have a sourcetype with events that provide information about an employee's ID. You can then create a field that extracts the ID from each event and then maps it to a field named employee_ID. You can then search for events matching a specific employee ID by referencing the field:value pair ```employee_ID=123456789```. Although you could simply search for ```123456789``` as a keyword (since Splunk is like Google, but for logs), this might return irrelevant results - as other events could contain the same number but not be related to an employee ID. You can also reference the field in a SPL command to count the number of events seen during a specific time period by each individual ID, like ```| stats count by employee_ID```.

As field extractions are typically scoped to a specific sourcetype, they are defined in `<my_addon>/default/props.conf` within the sourcetype stanza. However, **the exact method for defining field extractions depends on the event structure**.


For JSON and XML, setting KV_MODE enables automatic field extraction, where Splunk treats each key-value pair in each event as a field::value pair. The key names become the field names in Splunk.
```ini
[my_sourcetype] 
KV_MODE = [json|xml]
```


For CSV, where values are separated by a consistent delimiter, you need to specify:
- `FIELD_DELIMITER` → The character separating values (e.g., `,`, `;`, `|`).
- `FIELD_NAMES` → A comma-separated list of field names to assign to each value.
```ini
[my_sourcetype]
FIELD_DELIMITER = <character>
FIELD_NAMES = [<string>,...,<string>]
```


For events without a clear structure—where there are no obvious key-value pairs—you need to extract fields manually using regular expressions. However, if your events contain obvious key-value pairs (such as key=value or key::value), Splunk can automatically extract those fields without additional configuration.

```ini
[my_sourcetype]
EXTRACT-<class> = <regular expression> #the class is a unique identifier for the field extraction - i.e, no two field extractions can have the same class.
```
**Note:** The regular expression for each `EXTRACT` must include a capturing group. Only the portion that matches the capturing group will be assigned as the field value, and the group name will become the field name that can be referenced in a search. Also, for the same sourcetype, no two field extractions can have the exact same group name, as it will result in field collision. 


### What is a Field Alias?
A field alias allows you to rename an already extracted field, creating a new field without modifying or replacing the original.

When Splunk automatically extracts fields, the field names are based on the keys in the events. Chances are that these field names don't align with the field names that the use cases require to function. To solve this, you can create field aliases to standardize (i.e., normalize) the field names. 

Just like field extractions, field aliseses are typically scoped to a specific sourcetype and thus defined in `<my_addon>/default/props.conf` within the sourcetype stanza. 
```ini
[my_sourcetype]
FIELDALIAS-<class> = <original_field_name> AS <new_field_name> #the class is a unique identifier for the field alias - i.e, no two field alises can have the same class.
```

### What Fields Are Needed?
This repo comes with a number of pre-built [use cases](https://github.com/spettersson/splunk4patientprivacy/tree/0ba9865b121f96078699baeed1dc8db54b535732/use_cases) that require certain fields to function. While each use case specifies its required fields, these are the key fields you should ensure are in place:

- employee_ID
- employee_SSN
- employeee_name   
- employee_role_ID
- employee_role_name
- employee_workUnit_ID
- employee_workUnit_name
- employee_careProvider_ID
- employee_careProvider_name






- patient_ID
- patient_SSN
- patient_name
- patient_careUnit_ID
- patient_careUnit_name
- patient_careProvider_ID
- patient_careProvider_name











### **Event types**

<p align="center">
  <img src="images/eventtypes_v1.8.png" alt="eventtypes" style="width:80%;">
</p>

Event types serve as a mean to categorize events in Splunk to easier make sense of them at scale. By defining a set of field-value pairs and search terms, you can identify a group of events and save the result as an event type which then can be references in a search (for example, eventtype=journalaudit:cosmic), simplifying searches and ensuring consistency. Since Splunk uses schema-on-read, event types can be easily modified and updated over time.

Since your organization likely has multiple applications that hold events that fall into to the same category, you will inevitably end up with multiple event types. In such cases, you can assign them a common tag. This allows you to retrieve all desired events in a single search by simply referencing a tag (for example, tag=journalaudit), without manually specifying each event type.

For the use cases in this repository, each application is expected to have **one unique event type** (that is, journalaudit:<applicationName>). This event type must include events that records create/read/update/delete/export activities associated to patient journals. 

An event type can be created either through the Splunk UI (AKA Splunk Web) or Splunk configuration files - which approach you use depends on your preferences. The following is a step by step guide for how to create an event type in Splunk UI.

1. Navigate to **Settings > Event Types**
2. Click on **New Event Type**
3. In the field **Destination App**, select 'TA-patient-privacy'
4. In the **Name** field, enter a name for the event type.
   - This name should follow this format: journalaudit:vendor:application
   - example: journalaudit:cambio:cosmic
5. In the **Search string** field, enter the field::value pairs and search terms that captures the desired group of events from the application.
   - It's best practice to reference the index, host, source, and sourcetype fields associated with the application for performance reasons. These fields are mandatory across all events in Splunk and provides important metadata about for example where it originated, what kind of data it contains, and what index it is located in.
   - Depending on the application, additional field-value pairs and search terms may be necessary to narrow down the events to the desired group of events.
   - example: ```index=cosmic sourcetype IN ("cambio:cosmic:activity", "cambio:cosmic:access") source IN ("F_IX_ACTIVITY.txt", "F_IX_ACCESS") staff_ID=* patient_ID=* activity_type=*```
6. In the **Tag(s)** field, enter the value 'journalaudit'
    - When creating an event type via Splunk Web and reference a tag that does not already exist, Splunk automatically creates that tag for you.

Make sure to adjust permissions to ensure that the appropriate roles in Splunk have read and/or write access to the right event types.

































##### **For Splunk Cloud**
  - Navigate to **Apps → Manage Apps** in Splunk Web.
  - Click on **Create App**.
  - In the field **Name**, enter 'TA-patient-privacy'.
  - In the field **Folder Name**, enter 'TA-patient-privacy'.
  - In the field **Visible**, select 'No'
- Create the sourcetype(s).
  - Navigate to **Settings → Source Types** in Splunk Web.
  - Click **New Source Type**.
  - In the **Name** field, enter the name.
    - sourcetype names typically follow the format [\<vendor\>\:\<application\>:\<logCategory\>](https://docs.splunk.com/Documentation/AddOns/released/Overview/Sourcetypes?_gl=1*1ihn43k*_gcl_aw*R0NMLjE3MzY4NDU0MzMuQ2owS0NRaUFzNWk4QmhEbUFSSXNBR0U0eEh6cjhjclZaVG5CRjlzVVA2cEY4dFRjcGhUeUpsZUIzeVBYTWd2eUpSdVF5cHdtcUNYdnc3WWFBc2dRRUFMd193Y0I.*_gcl_au*MTIzNTEwMDQ2Ni4xNzMzMTI2NzQ3*FPAU*MTIzNTEwMDQ2Ni4xNzMzMTI2NzQ3*_ga*Mjg4NjYwNTkwLjE3MjUzNDU3NTA.*_ga_5EPM2P39FV*MTczODkzNTM0MS40NDAuMS4xNzM4OTM1NjYwLjAuMC40MTMwNzc2ODA.*_fplc*MUlEblIzNWlEZ1RieHdjRWhzekY3Snk3VnRza3FPdHNMQ1RPTmJVTWpEUFpHQ3d6dkJxJTJGZ3E2JTJGUjF4THhXQjlSQXJLaGlVbTAxQkx2RkxSekVmSE5zWk5ZdzdDOGdNaWtaUlJacHdSaUx2WjhBUTJZblJTdW1lZ0lXUTNpZyUzRCUzRA..#:~:text=Source%20type%20names,the%20vendor%2C%20OSSEC.)
      - example: cambio:cosmic:access
      - example: cambio:cosmic:activity
  - In the **Destination App**, select the app 'TA-patient-privacy'.
  - Click on **Event Breaks** and enter event line-breaking configurations
  - Click on **Advanced** and enter timestamp assignment configurations
  - Click **Save**.




##### **For Splunk Enterprise ([Distributed Deployment](https://docs.splunk.com/Documentation/Splunk/latest/Deploy/Distributedoverview#:~:text=To%20support%20larger,across%20the%20data.))**
If you are running a **distributed deployment**, sourcetypes must be defined in a Splunk app located on the [Manager Node](https://docs.splunk.com/Splexicon:Managernode) in the [indexer cluster](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutclusters#:~:text=An%20indexer%20cluster%20is,set%20of%20peer%20nodes.). This ensures that all sourcetypes can be created, managed and deployed from a central point to all peer nodes belonging to the cluster.

Run the following commands to
1. create a Splunk app,
2. then create the local/ directory inside the app, and
3. finally create a props.conf configuration file in that directory
```bash
$SPLUNK_HOME/bin/splunk new app TA-patient-privacy 
mkdir -p $SPLUNK_HOME/etc/apps/TA_patient_privacy/local/
nano $SPLUNK_HOME/etc/apps/TA_patient_privacy/local/props.conf
```
Add a stanza for each unique sourcetype inside [`props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf). 

Example:
```ini
[<my_sourcetype>] 
LINE_BREAKER = (\n+)
TIME_PREFIX = ^
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%6QZ
MAX_TIMESTAMP_LOOKAHEAD = 27
```

Then, instruct the Manager Node to deploy the Splunk app to the peer nodes in the cluster by following the steps described [here](https://docs.splunk.com/Documentation/Splunk/9.4.0/Indexer/Updatepeerconfigurations#:~:text=Admin%20Manual.-,Distribute%20the%20configuration%20bundle,the%20peers.%20This%20overwrites%20the%20contents%20of%20the%20peers%27%20current%20bundle.,-1.%20Prepare%20the).


