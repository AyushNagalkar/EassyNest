"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seed starting...');
    await prisma.adminActivityLog.deleteMany({});
    await prisma.flag.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.chatRoom.deleteMany({});
    await prisma.interest.deleteMany({});
    await prisma.compatibilityScore.deleteMany({});
    await prisma.propertyPhoto.deleteMany({});
    await prisma.propertyView.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.seekerProfile.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Database cleaned.');
    const adminHash = await bcrypt.hash('AdminPassword123!', 12);
    const ownerHash = await bcrypt.hash('OwnerPassword123!', 12);
    const tenantHash = await bcrypt.hash('TenantPassword123!', 12);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@eassynest.com',
            passwordHash: adminHash,
            name: 'System Admin',
            role: client_1.Role.ADMIN,
            emailVerified: true,
            phoneVerified: true,
            isActive: true,
        },
    });
    const owner1 = await prisma.user.create({
        data: {
            email: 'owner1@eassynest.com',
            passwordHash: ownerHash,
            name: 'Ramesh Kumar',
            role: client_1.Role.OWNER,
            phone: '+919876543210',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ramesh',
            emailVerified: true,
            isActive: true,
        },
    });
    const owner2 = await prisma.user.create({
        data: {
            email: 'owner2@eassynest.com',
            passwordHash: ownerHash,
            name: 'Sarah Dsouza',
            role: client_1.Role.OWNER,
            phone: '+919876543211',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
            emailVerified: true,
            isActive: true,
        },
    });
    const tenant1 = await prisma.user.create({
        data: {
            email: 'tenant1@eassynest.com',
            passwordHash: tenantHash,
            name: 'Amit Sharma',
            role: client_1.Role.TENANT,
            phone: '+919876543212',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Amit',
            emailVerified: true,
            isActive: true,
        },
    });
    const tenant2 = await prisma.user.create({
        data: {
            email: 'tenant2@eassynest.com',
            passwordHash: tenantHash,
            name: 'Priya Patel',
            role: client_1.Role.TENANT,
            phone: '+919876543213',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya',
            emailVerified: true,
            isActive: true,
        },
    });
    const tenant3 = await prisma.user.create({
        data: {
            email: 'tenant3@eassynest.com',
            passwordHash: tenantHash,
            name: 'Vikram Singh',
            role: client_1.Role.TENANT,
            phone: '+919876543214',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram',
            emailVerified: true,
            isActive: true,
        },
    });
    console.log('Users created.');
    const profile1 = await prisma.seekerProfile.create({
        data: {
            userId: tenant1.id,
            type: client_1.SeekerType.ROOM_SEEKER,
            preferredCity: 'Bangalore',
            preferredLat: 12.9716,
            preferredLng: 77.5946,
            budgetMin: 8000,
            budgetMax: 15000,
            moveInDate: new Date('2026-08-01'),
            bio: 'Software engineer at a fintech startup. Quiet, tidy, values privacy, early bird.',
            sleepSchedule: 'early_bird',
            cleanliness: 'very_clean',
            smoking: 'non_smoker',
            pets: 'no_pets',
            workFromHome: true,
            genderPreference: 'ANY',
            occupation: 'Software Engineer',
            age: 24,
        },
    });
    const profile2 = await prisma.seekerProfile.create({
        data: {
            userId: tenant2.id,
            type: client_1.SeekerType.FLATMATE_SEEKER,
            preferredCity: 'Bangalore',
            preferredLat: 12.9352,
            preferredLng: 77.6245,
            budgetMin: 10000,
            budgetMax: 18000,
            moveInDate: new Date('2026-08-15'),
            bio: 'UX designer who loves cooking, hiking, and movie nights. Looking for a friendly flatmate to share an apartment.',
            sleepSchedule: 'night_owl',
            cleanliness: 'moderate',
            smoking: 'outdoors_only',
            pets: 'pet_friendly',
            workFromHome: false,
            genderPreference: 'FEMALE_ONLY',
            occupation: 'Product Designer',
            age: 26,
        },
    });
    const profile3 = await prisma.seekerProfile.create({
        data: {
            userId: tenant3.id,
            type: client_1.SeekerType.BOTH,
            preferredCity: 'Bangalore',
            preferredLat: 12.9784,
            preferredLng: 77.6408,
            budgetMin: 12000,
            budgetMax: 22000,
            moveInDate: new Date('2026-08-10'),
            bio: 'Product manager, outgoing, fitness enthusiast. WFH 3 days a week. Has a friendly small retriever.',
            sleepSchedule: 'flexible',
            cleanliness: 'very_clean',
            smoking: 'non_smoker',
            pets: 'has_pets',
            workFromHome: true,
            genderPreference: 'ANY',
            occupation: 'Product Manager',
            age: 28,
        },
    });
    console.log('Seeker profiles created.');
    const prop1 = await prisma.property.create({
        data: {
            ownerId: owner1.id,
            title: 'Cozy Single Room in Koramangala',
            description: 'Fully furnished single room in a peaceful apartment. Close to tech parks, cafes, and restaurants.',
            city: 'Bangalore',
            address: '15, 4th Cross, Koramangala 3rd Block',
            lat: 12.9344,
            lng: 77.6244,
            rent: 12000,
            availableFrom: new Date('2026-08-01'),
            roomType: client_1.RoomType.SINGLE_ROOM,
            furnishing: client_1.FurnishingStatus.FURNISHED,
            amenities: ['wifi', 'parking', 'ac', 'washing_machine', 'gym'],
            rules: ['no_smoking', 'no_loud_parties'],
            petFriendly: false,
            genderPreference: 'ANY',
            leaseLengthMonths: 11,
            status: client_1.ListingStatus.ACTIVE,
        },
    });
    const prop2 = await prisma.property.create({
        data: {
            ownerId: owner1.id,
            title: 'Spacious 2BHK Flat in Indiranagar',
            description: 'Brand new 2BHK flat available for rent. Semi-furnished, spacious living room, modern kitchen, and parking.',
            city: 'Bangalore',
            address: '22, 100 Feet Rd, Indiranagar',
            lat: 12.9719,
            lng: 77.6412,
            rent: 28000,
            availableFrom: new Date('2026-08-05'),
            roomType: client_1.RoomType.TWO_BHK,
            furnishing: client_1.FurnishingStatus.SEMI_FURNISHED,
            amenities: ['wifi', 'parking', 'power_backup', 'security'],
            rules: ['pet_friendly'],
            petFriendly: true,
            genderPreference: 'ANY',
            leaseLengthMonths: 12,
            status: client_1.ListingStatus.ACTIVE,
        },
    });
    const prop3 = await prisma.property.create({
        data: {
            ownerId: owner1.id,
            title: 'Studio Apartment near HSR Layout',
            description: 'Modern studio apartment perfect for single professionals. Fully setup with high-speed internet and AC.',
            city: 'Bangalore',
            address: '105, 27th Main Rd, HSR Sector 1',
            lat: 12.9105,
            lng: 77.6450,
            rent: 16000,
            availableFrom: new Date('2026-07-25'),
            roomType: client_1.RoomType.STUDIO,
            furnishing: client_1.FurnishingStatus.FURNISHED,
            amenities: ['wifi', 'parking', 'ac', 'fridge', 'microwave'],
            rules: ['no_smoking'],
            petFriendly: false,
            genderPreference: 'ANY',
            leaseLengthMonths: 6,
            status: client_1.ListingStatus.ACTIVE,
        },
    });
    const prop4 = await prisma.property.create({
        data: {
            ownerId: owner2.id,
            title: 'Shared Room for Girls in Whitefield',
            description: 'Shared room in a luxurious 3BHK gated community. High security, great amenities including pool and clubhouse.',
            city: 'Bangalore',
            address: 'Prestige Shantiniketan, Whitefield',
            lat: 12.9842,
            lng: 77.7335,
            rent: 7500,
            availableFrom: new Date('2026-08-10'),
            roomType: client_1.RoomType.SHARED_ROOM,
            furnishing: client_1.FurnishingStatus.FURNISHED,
            amenities: ['wifi', 'swimming_pool', 'gym', 'washing_machine', 'parking'],
            rules: ['female_only', 'no_drinking'],
            petFriendly: false,
            genderPreference: 'FEMALE_ONLY',
            leaseLengthMonths: 11,
            status: client_1.ListingStatus.ACTIVE,
        },
    });
    const prop5 = await prisma.property.create({
        data: {
            ownerId: owner2.id,
            title: '1BHK Independent House in Jayanagar',
            description: 'Charming 1BHK ground floor house with a small garden. Quiet neighborhood, close to metro station.',
            city: 'Bangalore',
            address: '45, 9th Main, Jayanagar 4th Block',
            lat: 12.9250,
            lng: 77.5897,
            rent: 14500,
            availableFrom: new Date('2026-08-01'),
            roomType: client_1.RoomType.ONE_BHK,
            furnishing: client_1.FurnishingStatus.UNFURNISHED,
            amenities: ['parking'],
            rules: ['no_smoking', 'vegetarian_preferred'],
            petFriendly: true,
            genderPreference: 'ANY',
            leaseLengthMonths: 11,
            status: client_1.ListingStatus.ACTIVE,
        },
    });
    console.log('Properties created.');
    await prisma.propertyPhoto.createMany({
        data: [
            { propertyId: prop1.id, url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', order: 0 },
            { propertyId: prop1.id, url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', order: 1 },
            { propertyId: prop2.id, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', order: 0 },
            { propertyId: prop3.id, url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80', order: 0 },
            { propertyId: prop4.id, url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', order: 0 },
            { propertyId: prop5.id, url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', order: 0 },
        ],
    });
    console.log('Property photos created.');
    await prisma.compatibilityScore.create({
        data: {
            seekerProfileId: profile1.id,
            targetType: client_1.TargetType.PROPERTY,
            targetPropertyId: prop1.id,
            score: 92,
            source: client_1.ScoreSource.RULE_BASED,
            explanation: 'Excellent budget fit, perfect city match, available from dates align exactly, and preferences are fully compatible.',
        },
    });
    await prisma.compatibilityScore.create({
        data: {
            seekerProfileId: profile1.id,
            targetType: client_1.TargetType.PROPERTY,
            targetPropertyId: prop3.id,
            score: 84,
            source: client_1.ScoreSource.RULE_BASED,
            explanation: 'Good budget match, same city, available within a week. High alignment with independent professional setup.',
        },
    });
    await prisma.compatibilityScore.create({
        data: {
            seekerProfileId: profile3.id,
            targetType: client_1.TargetType.PROPERTY,
            targetPropertyId: prop2.id,
            score: 88,
            source: client_1.ScoreSource.RULE_BASED,
            explanation: 'Great budget overlap, pet friendly policy aligns with dog ownership, and available dates match.',
        },
    });
    await prisma.compatibilityScore.create({
        data: {
            seekerProfileId: profile2.id,
            targetType: client_1.TargetType.SEEKER_PROFILE,
            targetSeekerProfileId: profile3.id,
            score: 74,
            source: client_1.ScoreSource.RULE_BASED,
            explanation: 'Same city, overlapping budgets, and close move-in dates. Cleanliness matches, sleep schedule difference is moderate.',
        },
    });
    console.log('Compatibility scores seeded.');
    const interest1 = await prisma.interest.create({
        data: {
            fromUserId: tenant1.id,
            targetType: client_1.TargetType.PROPERTY,
            targetPropertyId: prop1.id,
            status: client_1.InterestStatus.ACCEPTED,
        },
    });
    const interest2 = await prisma.interest.create({
        data: {
            fromUserId: tenant3.id,
            targetType: client_1.TargetType.PROPERTY,
            targetPropertyId: prop2.id,
            status: client_1.InterestStatus.PENDING,
        },
    });
    const interest3 = await prisma.interest.create({
        data: {
            fromUserId: tenant2.id,
            targetType: client_1.TargetType.SEEKER_PROFILE,
            targetSeekerProfileId: profile3.id,
            status: client_1.InterestStatus.ACCEPTED,
        },
    });
    console.log('Interests seeded.');
    const room1 = await prisma.chatRoom.create({
        data: {
            interestId: interest1.id,
        },
    });
    const room2 = await prisma.chatRoom.create({
        data: {
            interestId: interest3.id,
        },
    });
    await prisma.message.createMany({
        data: [
            {
                chatRoomId: room1.id,
                senderId: tenant1.id,
                content: 'Hello Ramesh, I really liked your room in Koramangala. Is it available for a visit this weekend?',
                createdAt: new Date(Date.now() - 3600000 * 24),
            },
            {
                chatRoomId: room1.id,
                senderId: owner1.id,
                content: 'Hi Amit! Yes, it is available. Sunday afternoon works best for me. Would 4 PM be fine?',
                createdAt: new Date(Date.now() - 3600000 * 23),
                readAt: new Date(Date.now() - 3600000 * 22),
            },
            {
                chatRoomId: room1.id,
                senderId: tenant1.id,
                content: 'Perfect, 4 PM on Sunday works for me. See you then! Could you share the exact block?',
                createdAt: new Date(Date.now() - 3600000 * 22),
            },
        ],
    });
    await prisma.message.createMany({
        data: [
            {
                chatRoomId: room2.id,
                senderId: tenant2.id,
                content: 'Hey Vikram! I saw you are looking for a flatmate in Indiranagar/Koramangala area. I have a 2BHK listing shortlist we could check out.',
                createdAt: new Date(Date.now() - 3600000 * 2),
            },
            {
                chatRoomId: room2.id,
                senderId: tenant3.id,
                content: 'Hi Priya, that sounds great. What budget range are you looking at?',
                createdAt: new Date(Date.now() - 3600000 * 1.5),
                readAt: new Date(Date.now() - 3600000 * 1.4),
            },
        ],
    });
    console.log('ChatRooms and messages seeded.');
    await prisma.notification.createMany({
        data: [
            {
                userId: owner1.id,
                type: 'INTEREST_RECEIVED',
                title: 'New Interest on Koramangala room',
                body: 'Amit Sharma has expressed interest with a 92% match score.',
                read: true,
            },
            {
                userId: tenant1.id,
                type: 'INTEREST_ACCEPTED',
                title: 'Interest Accepted!',
                body: 'Ramesh Kumar accepted your interest on Cozy Single Room in Koramangala. Go start chatting!',
                read: false,
            },
            {
                userId: owner1.id,
                type: 'INTEREST_RECEIVED',
                title: 'New Interest on Indiranagar flat',
                body: 'Vikram Singh has expressed interest with an 88% match score.',
                read: false,
            },
        ],
    });
    await prisma.propertyView.createMany({
        data: [
            { propertyId: prop1.id, viewerId: tenant1.id, viewerIp: '127.0.0.1' },
            { propertyId: prop1.id, viewerId: tenant2.id, viewerIp: '127.0.0.1' },
            { propertyId: prop2.id, viewerId: tenant3.id, viewerIp: '127.0.0.1' },
        ],
    });
    await prisma.review.create({
        data: {
            authorId: tenant1.id,
            targetId: owner1.id,
            interestId: interest1.id,
            rating: 5,
            comment: 'Ramesh is an excellent host. Very helpful and responsive throughout the move-in process.',
        },
    });
    await prisma.adminActivityLog.create({
        data: {
            actorId: admin.id,
            action: 'SEED_DATABASE',
            targetType: 'SYSTEM',
            targetId: 'ALL',
            meta: { message: 'Database successfully seeded with development data' },
        },
    });
    console.log('All logs, reviews, and views seeded successfully.');
    console.log('Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map