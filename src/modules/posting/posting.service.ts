import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AddPostDto } from 'src/dtos/post.dto';

@Injectable()
export class PostingService {


    constructor() { }
    async createUserProfile(req) {
        try {
            const API_KEY = 'S3CC888-8HJ4DHE-HCNWTZ0-7GEBR21';
            const url = 'https://app.ayrshare.com/api/profiles/profile';
            const data = {
                title: 'ACME Profile'
            };

            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response:', response.data);
            // Handle response as needed
        } catch (error) {
            console.error('Error:', error.response.data);
            // Handle error
        }

        // then update user profileKey in db 
    }

    async addPost(userId: number, addPostDto: AddPostDto) {
        try {
            const API_KEY = ''; // Replace with your Ayrshare API key
            const url = 'https://app.ayrshare.com/api/post';
            const data = {
                ...addPostDto,
                profileKey: '', // Use the user ID to get profileKey
            };

            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response:', response.data);
            // Handle response as needed
        } catch (error) {
            console.error('Error:', error.response.data);
            // Handle error
        }
    }
}
