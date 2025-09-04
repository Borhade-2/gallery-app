// import axios from 'axios';
import * as baseApi from '../networking/Api';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// api.ts
export interface FetchImagesParams {
  page: number;
  pageSize: number;
  orderBy?: number;   // field to sort by
  orderAsc?: boolean; // true = ascending, false = descending
  retries?: number;   // retry attempts
  timeout?: number;   // request timeout in ms
}

// const API_BASE = "https://openapi.fotoowl.ai/open/event";
console.log('api',baseApi.baseApi);

export const fetchImages = async ({
  page,
  pageSize,
  orderBy = 2,
  orderAsc = true,
  retries = 3,
  timeout = 10000,
}: FetchImagesParams) => {
  const url = `${baseApi.baseApi}/image-list?event_id=154770&page=${page}&page_size=${pageSize}&key=4030&order_by=${orderBy}&order_asc=${orderAsc}`;

  console.log('url',url);
  
  let attempt = 0;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data = await res.json();
      return data;
    } catch (err: any) {
      clearTimeout(timer);
      if (attempt === retries) throw err;

      // exponential backoff: 500ms → 1000ms → 2000ms...
      const backoff = Math.pow(2, attempt) * 500;
      console.warn(`Retrying... attempt ${attempt + 1} after ${backoff}ms`);
      await new Promise((res) => setTimeout(res, backoff));
    } finally {
      attempt++;
    }
  }
};
