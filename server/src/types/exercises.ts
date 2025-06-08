export interface Exercise {
    id: string;
    name: string;
    force: string | null;
    level: string | null;
    mechanic: string | null;
    equipment: string | null;
    primary_muscles: string[];
    secondary_muscles: string[];
    instructions: string[];
    category: string | null;
    images: string[];
    image_urls: string[];
    created_at: string;
}
