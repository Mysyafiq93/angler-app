import { initialPosts } from "@/data/mock-data";
import type { CatchPost } from "@/types/domain";

export interface PostRepository {
  list(): Promise<CatchPost[]>;
  create(post: CatchPost): Promise<CatchPost>;
}

export const mockPostRepository: PostRepository = {
  async list() {
    return initialPosts;
  },
  async create(post) {
    return post;
  },
};

// Replace this export with a Supabase implementation after the schema is created.
export const postRepository = mockPostRepository;
