import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Blog } from '../models/Blog';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class BlogService {
    blogUrl: string = environment.blogApiUrl;
    constructor(
        private http: HttpClient
        ){}

    getBlog(slug: string) {
        return this.http.get<Blog>(`${this.blogUrl}?slug=${slug}`);
        // console.log({slug});
        // return {
        //     title: 'Hulk vs Red Hulk',
        //     content: `<strong>What is Lorem Ipsum?</strong><br/>
        //     Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        //     <br/>
        //     <img class="blog-image" src="https://picsum.photos/200/150" />
        //     <br/>
        //     <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. </p>
        //     <br/>
        //     <div class="ads">
        //     <h3>Ads</h3>
        //     <iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-in.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=IN&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=thesuperheroe-21&language=en_IN&marketplace=amazon&region=IN&placement=B085B2DMMK&asins=B085B2DMMK&linkId=8e333d23f8a7e1f51a95ca7120f853ef&show_border=true&link_opens_in_new_window=true"></iframe>
        //     <iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-in.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=IN&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=thesuperheroe-21&language=en_IN&marketplace=amazon&region=IN&placement=B00ET0MXNO&asins=B00ET0MXNO&linkId=f572af459be318a6dc86f5207dafed18&show_border=true&link_opens_in_new_window=true"></iframe>
        //     </div>`,
        //     titleImage: 'https://picsum.photos/400/300'
        // }
    }
}
