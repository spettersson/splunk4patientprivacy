``` init
tag=emraudit
| fields staff_ID, patient_ID
| stats count by staff_ID, patient_ID
| lookup patientpii_lookup patient_ID OUTPUT residential_street_name AS patient_residential_street_name, residential_street_number AS patient_residential_street_number, residential_postal_code AS patient_residential_postal_code, government_issued_id
| lookup staffpii_lookup staff_ID OUTPUT residential_street_name AS staff_residential_street_name, residential_street_number AS staff_residential_street_number, residential_postal_code AS staff_residential_postal_code, government_issued_id
| eval staff_residential_address = staff_residential_street_name + staff_residential_street_number
| eval patient_residential_address = patient_residential_street_name + patient_residential_street_number
| eval matching_address = if(staff_residential_address == patient_residential_address, "true", "false")
| eval matching_street_name = if(staff_residential_street_name == patient_residential_street_name, "true", "false")
| eval matching_postal_code = if(staff_residential_postal_code == patient_residential_postal_code, "true", "false")
| where matching_address="true" OR matching_street_name="true" OR matching_postal_code="true"
| eval risk_factor = case(
    matching_address == "true", 2, 
    matching_street_name == "true", 1.5,
    matching_postal_code == "true", 1.25, 
    true(), 1
)			
| eval detection_id = "00000000001"
| lookup detection_metadata detection_id OUTPUT detection_name, detection_description, detection_type
| lookup detection_risk detection_id OUTPUT risk_score
| eval risk_score = risk_factor * risk_score
| fields staff_*, patient_*, matching_*, risk_*, detection_*
```
