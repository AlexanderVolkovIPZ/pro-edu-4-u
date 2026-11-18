import { HttpClient, HttpResponse } from '../../core/HttpClient';

export interface AuctionDto {
  id: string;
  title: string;
}

export class AuctionsApi {
  constructor(private readonly http: HttpClient) {}

  get(id: string): Promise<HttpResponse> {
    return this.http.send('GET', `/api/auction/${id}`);
  }

  async getTitle(id: string): Promise<string> {
    return (await this.get(id)).json<AuctionDto>().title;
  }

  update(id: string, patch: Partial<AuctionDto>): Promise<HttpResponse> {
    return this.http.send('PATCH', `/api/auction/${id}`, { data: patch });
  }
}
