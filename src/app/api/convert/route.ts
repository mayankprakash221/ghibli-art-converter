import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    console.log('Starting API request processing...');
    
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const additionalDetails = formData.get('details') as string;
    const visionPrompt = formData.get('visionPrompt') as string;

    if (!file) {
      console.log('No image file provided in request');
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return NextResponse.json(
        { error: 'Image size should be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert the file to buffer
    console.log('Converting file to buffer...');
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert buffer to base64
    console.log('Converting buffer to base64...');
    const base64Image = buffer.toString('base64');
    console.log('Base64 conversion complete, length:', base64Image.length);

    // Step 1: Use GPT-4 Vision to analyze the image and generate a prompt
    console.log('Starting GPT-4 Vision analysis...');
    
    // Use the vision prompt from frontend and add additional details if provided
    let finalVisionPrompt = visionPrompt;
    if (additionalDetails) {
      finalVisionPrompt += `\n\nAdditional user requirements to incorporate while maintaining the above structure:
${additionalDetails}`;
    }

    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: finalVisionPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    let prompt = visionResponse.choices[0].message.content;
    if (!prompt) {
      throw new Error('No prompt generated from GPT-4 Vision');
    }
    console.log('Generated prompt:', prompt);

    // Add reinforcement instruction
    prompt += `
Important: Do not change any part of the photo's structure or clothing. This is a redraw in Studio Ghibli style, not a reinterpretation.`;

    // Step 2: Use DALL-E 3 to generate the image
    console.log('Starting DALL-E 3 image generation...');
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard"
    });

    const imageUrl = dalleResponse.data[0].url;
    console.log('Generated image URL:', imageUrl);

    if (!imageUrl) {
      throw new Error('No image URL received from DALL-E');
    }

    // Download the generated image with retries
    let retries = 3;
    let imageBuffer;
    
    while (retries > 0) {
      try {
        console.log(`Attempt ${4 - retries} to download image...`);
        const imageResponse = await fetch(imageUrl, {
          headers: {
            'Accept': 'image/png,image/jpeg,image/webp,*/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!imageResponse.ok) {
          console.log('Image download failed:', imageResponse.status, imageResponse.statusText);
          throw new Error(`HTTP error! status: ${imageResponse.status}`);
        }

        imageBuffer = await imageResponse.arrayBuffer();
        console.log('Image downloaded successfully, size:', imageBuffer.byteLength);
        break;
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          console.log('All download attempts failed:', error.message);
          throw new Error(`Failed to download image after 3 attempts: ${error.message}`);
        }
        console.log(`Retry attempt ${3 - retries} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    }

    console.log('Successfully generated and downloaded image');

    // Return the generated image
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="ghibli-style.jpg"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      name: error.name,
      code: error.code
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Error generating image. Please try again.',
        details: error.response?.data || error.stack,
        type: error.name,
        code: error.code
      },
      { status: 500 }
    );
  }
} 