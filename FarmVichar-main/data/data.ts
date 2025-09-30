import { DataOfLogType } from "@/types/types";

export const dummyProfile = {
  id: "dummyUser123",
  fullName: "Ramesh Kumar",
  phone: "9876543210",
  age: 45,
  gender: "Male",
  educationLevel: "High School",
  farmingExperienceYears: 20,
};

export const dummyFarms = [
  {
    id: "dummyFarm1",
    village: "Kainakary",
    taluka: "Kuttanad",
    district: "Alappuzha",
    state: "Kerala",
    pinCode: "688501",
    totalFarmArea: 5.5,
    soilType: "Alluvial",
    waterSource: "River",
    irrigationMethod: "Canal",
    climateNotes: "Tropical monsoon climate",
  },
  {
    id: "dummyFarm2",
    village: "Champakulam",
    taluka: "Kuttanad",
    district: "Alappuzha",
    state: "Kerala",
    pinCode: "688505",
    totalFarmArea: 3.2,
    soilType: "Clay",
    waterSource: "Bore well",
    irrigationMethod: "Drip",
    climateNotes: "High humidity region",
  },
];

export const mockDataOfLog: DataOfLogType[] = [
  {
    farmId: "AHJbtjc3Vi4OriO5TJmL",
    activityType: "Fertilizer",
    description: "Applied organic manure.",
    geoLocation: null,
    id: "Wd2cTvdp2ETlqNXNeu8e",
    timestamp: "2025-09-19T03:45:54.779358Z"
  },
  {
    farmId: "JNwLmHMe9ya20wNlZ0sS",
    activityType: "Sowing",
    description: "Sowed Uma variety paddy seeds.",
    geoLocation: null,
    id: "iI0ciR54G8uU1t1hVeaJ",
    timestamp: "2025-09-19T03:45:54.447282Z"
  },
  {
    farmId: "AHJbtjc3Vi4OriO5TJmL",
    activityType: "Irrigation",
    description: "Watered the east field for 2 hours.",
    geoLocation: null,
    id: "Wd2cTvdp2ETlqNXNeu8f",
    timestamp: "2025-09-18T03:45:54.779358Z"
  },
  {
    farmId: "JNwLmHMe9ya20wNlZ0sS",
    activityType: "Pest Control",
    description: "Sprayed pesticide on south field.",
    geoLocation: null,
    id: "iI0ciR54G8uU1t1hVeaK",
    timestamp: "2025-09-17T03:45:54.447282Z"
  },
  {
    farmId: "AHJbtjc3Vi4OriO5TJmL",
    activityType: "Harvesting",
    description: "Harvested rice from east field.",
    geoLocation: null,
    id: "Wd2cTvdp2ETlqNXNeu8g",
    timestamp: "2025-09-16T03:45:54.779358Z"
  },
  {
    farmId: "JNwLmHMe9ya20wNlZ0sS",
    activityType: "Monitoring",
    description: "Checked soil moisture levels.",
    geoLocation: null,
    id: "iI0ciR54G8uU1t1hVeaL",
    timestamp: "2025-09-15T03:45:54.447282Z"
  },
]


export const message = `**Answer:**

Yes, drain the excess water immediately to protect your seedlings, regardless of water levels in neighboring fields.

**Reasoning:**

*   **Seedling Vulnerability:** Paddy seedlings, especially in the early stages, are susceptible to damage and reduced growth due to prolonged submergence.
*   **Pest Risk:** While Kerala's high humidity favors pests, allowing stagnant water increases pest and disease incidence, as indicated by the predicted pest risk of 40%.
*   **Kuttanad Context:** Kuttanad's rice fields are traditionally managed with integrated systems. The information you have to follow Rice-Fish-Duck-Buffalo Integration is important, but it requires controlled water levels. Uncontrolled flooding is detrimental.

**Solution:**

1.  **Immediate Drainage:** Open drainage channels to remove excess water from your field to prevent seedling damage.
2.  **Monitor Pest Activity:** Closely observe your seedlings for signs of pests or diseases. If necessary, consider using bio-pesticides or other environmentally friendly pest control methods as outlined in the provided text regarding organic farming in Kerala.
3.  **Optimize Water Management:** After the rains subside, manage water levels carefully, using the Rice-Fish-Duck-Buffalo Integration model if applicable, but prioritize optimal conditions for rice growth.
4.  **Consider PM-KISAN scheme benefits:** Explore if you can avail any benefits for crop losses due to rains or pest damage with PM-KISAN scheme for agriculture benifits`