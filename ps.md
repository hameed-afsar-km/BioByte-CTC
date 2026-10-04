# BioByte - Problem Statements (Omnicon)

Below are the 5 official problem statements for the BioByte project expo. Each problem is associated with an alien DNA track, complete with domains, tech stacks, expected outputs, and key deliverables.

---

## 1. Cold Chain Guardian (Heatblast Track)
**Domain:** Pharma Logistics · IoT  
**Tags:** Cold Chain, IoT, Predictive Analytics  
**Brief:** Know the moment a vaccine is spoiled — and who needs to hear about it first.  

**Summary:**  
Build a smart package for temperature-sensitive biologics that logs excursions, predicts whether the drug is still usable, and alerts the right person.

**Expected Output:**  
A smart cold-chain system that continuously monitors and records temperature conditions, detects excursions, uses predictive models to assess whether the product remains within acceptable limits, provides real-time alerts, and maintains a digital record.

**Key Technical Points:**
- Continuously log temperature across the whole shipping journey
- Predict remaining viability from cumulative thermal exposure
- Alert the right person the moment an excursion crosses the limit

**Recommended Tech Stack:** BLE / LoRa / GSM tracking, Temperature and humidity sensing, Time-series forecasting, Alerting dashboards

---

## 2. Bench-Top Smart Bioreactor (Upgrade Track)
**Domain:** Bioprocess · Control Systems  
**Tags:** Process Control, Sensors, Automation  
**Brief:** Put a working bioreactor on a teaching-lab bench, not a factory budget.  

**Summary:**  
Make a low-cost lab bioreactor that automatically controls temperature, pH, dissolved oxygen and agitation, with a model that predicts growth and flags deviations early.

**Expected Output:**  
A low-cost bench-top bioreactor that automatically monitors and controls critical parameters (temperature, pH, dissolved oxygen, agitation), integrated with a predictive model to estimate growth, detect abnormal trends, and provide early warnings of process deviations.

**Key Technical Points:**
- Closed-loop control of temperature, pH, dissolved oxygen and agitation
- A model that predicts growth and flags deviation early
- A bill of materials a teaching lab can actually afford

**Recommended Tech Stack:** Closed-loop PID control, pH / DO / temperature probes, ESP32 or STM32, Growth modelling

---

## 3. Pocket Microscope for Rural Labs (Grey Matter Track)
**Domain:** Bio-imaging · Public Health  
**Tags:** Imaging, Cell Counting, Low Cost  
**Brief:** Give a rural lab a microscope and an analyst for the price of a phone.  

**Summary:**  
Design an affordable smartphone-based microscope setup with AI that counts and classifies cells and flags abnormalities.

**Expected Output:**  
An affordable, portable smartphone-based microscope setup with an AI system capable of counting and classifying cells, identifying predefined abnormalities, and providing simple analysis suitable for low-resource environments.

**Key Technical Points:**
- An affordable optical and mechanical setup that works with a phone
- Counting and classifying cells straight from the captured field
- Flagging abnormalities for a technician with no lab nearby

**Recommended Tech Stack:** Optical design and lens arrays, Smartphone imaging, Computer vision, On-device ML

---

## 4. Biomedical Waste Sorter (Diamondhead Track)
**Domain:** Environmental Health · Automation  
**Tags:** Waste Management, Sterilisation, Safety  
**Brief:** Prove the waste was actually made safe, instead of assuming it was.  

**Summary:**  
Build a system that identifies and segregates hospital waste and verifies safe sterilisation or disposal.

**Expected Output:**  
An intelligent system that identifies and automatically segregates different categories of biomedical waste using computer vision or sensors, incorporates a method to monitor or verify appropriate sterilization or disposal, and improves traceability.

**Key Technical Points:**
- Identifying and segregating waste at the point of collection
- Verifying sterilisation actually happened, not just that it was logged
- An auditable chain from bin to final disposal

**Recommended Tech Stack:** Image classification, Colour and spectroscopy sensing, Microbial load assays, Compliance logging

---

## 5. Antibiotic Resistance Radar (XLR8 Track)
**Domain:** Healthcare Analytics · Bioinformatics  
**Tags:** Health Data, Predictive Analytics, Epidemiology  
**Brief:** Detect emerging antimicrobial-resistance patterns before they spread.  

**Summary:**  
Hospitals generate enormous amounts of microbiological and prescription data. Build a platform that detects emerging antimicrobial-resistance patterns and provides an early warning to clinicians.

**Expected Output:**  
A data platform that ingests microbiological and prescription data, applies models to identify emerging resistance patterns, and presents an early-warning dashboard for clinicians.

**Key Technical Points:**
- Ingesting and standardising diverse hospital and lab data
- Detecting resistance patterns faster than manual reviews
- Providing an actionable early-warning dashboard for clinicians

**Recommended Tech Stack:** Data pipelines, Machine learning, Clinical data mining, Dashboards
