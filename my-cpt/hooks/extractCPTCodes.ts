// This is the same mock function from your frontend
export function extractCPTCodes(text: string): string[] {
  const mockCPTCodes = [
    "99213 - Office or other outpatient visit",
    "99214 - Office or other outpatient visit, moderate complexity",
    "99395 - Periodic comprehensive preventive medicine examination",
    "90832 - Psychotherapy, 30 minutes",
    "96127 - Brief emotional/behavioral assessment",
    "99203 - Office or other outpatient visit for new patient",
    "99212 - Office or other outpatient visit for established patient",
    "90847 - Family psychotherapy including patient",
  ];

  const numberOfCodes = Math.min(Math.floor(text.length / 50) + 1, 4);
  return mockCPTCodes.sort(() => 0.5 - Math.random()).slice(0, numberOfCodes);
} 