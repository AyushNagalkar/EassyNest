"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSystemPrompt = buildSystemPrompt;
exports.buildPropertyScoringPrompt = buildPropertyScoringPrompt;
exports.buildSeekerScoringPrompt = buildSeekerScoringPrompt;
function buildSystemPrompt() {
    return `You are a compatibility scoring engine for a rental/flatmate-finding platform. 
Score based on budget fit, location match, move-in date proximity, and lifestyle compatibility.
Respond with JSON only, no markdown, no prose outside the JSON object.
The JSON must have exactly two keys: "score" (integer 0-100) and "explanation" (string, max 200 chars).`;
}
function buildPropertyScoringPrompt(seeker, property) {
    const lifestyleBlock = buildLifestyleBlock(seeker);
    return `Room listing:
- City: ${property.city}
- Rent: ₹${property.rent}/month
- Room type: ${property.roomType}
- Furnishing: ${property.furnishing}
- Available from: ${formatDate(property.availableFrom)}
- Pet-friendly: ${property.petFriendly ? 'Yes' : 'No'}
- Gender preference: ${property.genderPreference || 'ANY'}
${property.amenities?.length ? `- Amenities: ${property.amenities.join(', ')}` : ''}
${property.rules?.length ? `- Rules: ${property.rules.join(', ')}` : ''}

Tenant profile:
- Preferred city: ${seeker.preferredCity}
- Budget: ₹${seeker.budgetMin} - ₹${seeker.budgetMax}/month
- Move-in date: ${formatDate(seeker.moveInDate)}
${lifestyleBlock}

Compute a compatibility score from 0 to 100 based on budget fit, location match, move-in date proximity, and any lifestyle factors provided.
Return JSON: { "score": number, "explanation": string }`;
}
function buildSeekerScoringPrompt(a, b) {
    const lifestyleA = buildLifestyleBlock(a);
    const lifestyleB = buildLifestyleBlock(b);
    return `Person A is looking for a flatmate:
- City: ${a.preferredCity}
- Budget: ₹${a.budgetMin} - ₹${a.budgetMax}/month
- Move-in date: ${formatDate(a.moveInDate)}
${a.bio ? `- Bio: ${a.bio}` : ''}
${lifestyleA}

Person B is looking for a flatmate:
- City: ${b.preferredCity}
- Budget: ₹${b.budgetMin} - ₹${b.budgetMax}/month
- Move-in date: ${formatDate(b.moveInDate)}
${b.bio ? `- Bio: ${b.bio}` : ''}
${lifestyleB}

Compute a compatibility score from 0 to 100 based on budget overlap, location match, move-in date proximity, and lifestyle compatibility.
Return JSON: { "score": number, "explanation": string }`;
}
function buildLifestyleBlock(seeker) {
    const lines = [];
    if (seeker.sleepSchedule)
        lines.push(`- Sleep schedule: ${seeker.sleepSchedule}`);
    if (seeker.cleanliness)
        lines.push(`- Cleanliness: ${seeker.cleanliness}`);
    if (seeker.smoking)
        lines.push(`- Smoking: ${seeker.smoking}`);
    if (seeker.pets)
        lines.push(`- Pets: ${seeker.pets}`);
    if (seeker.workFromHome != null)
        lines.push(`- Works from home: ${seeker.workFromHome ? 'Yes' : 'No'}`);
    if (seeker.genderPreference && seeker.genderPreference !== 'ANY') {
        lines.push(`- Gender preference: ${seeker.genderPreference}`);
    }
    if (seeker.occupation)
        lines.push(`- Occupation: ${seeker.occupation}`);
    if (seeker.age)
        lines.push(`- Age: ${seeker.age}`);
    return lines.length > 0 ? lines.join('\n') : '';
}
function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}
//# sourceMappingURL=scoring.prompts.js.map