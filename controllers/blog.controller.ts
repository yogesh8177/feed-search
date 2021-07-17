import { requestHandler, globals, cors, benchmark } from '../decorators/decorators';
import GlobalOptions from '../models/GlobalOptions';
import Blog from '../models/Blog';

export class BlogController {
    constructor(private options?: GlobalOptions) {}

    @benchmark()
    @cors()
    @requestHandler
    async fetchBlog (req, res) {
        const blog = new Blog();

        return blog;
    }
}
