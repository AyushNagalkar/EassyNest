# Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Property : "owns (OWNER)"
    User ||--o| SeekerProfile : "has (TENANT)"
    User ||--o{ Interest : "sends"
    User ||--o{ Message : "sends"
    User ||--o{ Notification : "receives"
    User ||--o{ Favorite : "saves"

    Property ||--o{ PropertyPhoto : "has"
    Property ||--o{ CompatibilityScore : "scored against"
    Property ||--o{ Interest : "receives"
    Property ||--o{ Favorite : "saved as"

    SeekerProfile ||--o{ CompatibilityScore : "owns scores / is scored"
    SeekerProfile ||--o{ Interest : "receives (flatmate match)"

    Interest ||--o| ChatRoom : "unlocks"
    ChatRoom ||--o{ Message : "contains"

    User {
        string id PK
        string email
        string role
    }
    Property {
        string id PK
        string ownerId FK
        string city
        int rent
        string status
    }
    SeekerProfile {
        string id PK
        string userId FK
        string type
        int budgetMin
        int budgetMax
    }
    CompatibilityScore {
        string id PK
        string seekerProfileId FK
        string targetType
        int score
        string source
    }
    Interest {
        string id PK
        string fromUserId FK
        string targetType
        string status
    }
    Message {
        string id PK
        string chatRoomId FK
        string senderId FK
        string content
    }
```

## Two matching directions, one scoring table
- **Room search:** `SeekerProfile(type=ROOM_SEEKER)` → `Property` (owner's listing)
- **Flatmate search:** `SeekerProfile(type=FLATMATE_SEEKER)` → another `SeekerProfile` (public flatmate post)
- `CompatibilityScore.targetType` decides which foreign key (`targetPropertyId` or `targetSeekerProfileId`) is populated. Only one is ever non-null per row.
- Same rule applies to `Interest` — it can target a `Property` or a `SeekerProfile`, never both.
