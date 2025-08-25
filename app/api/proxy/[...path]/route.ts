// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://165.227.182.17/api';

// Create an HTTPS agent that ignores SSL certificate errors for development
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  httpsAgent: process.env.NODE_ENV === 'development' ? httpsAgent : undefined,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const response = await axiosInstance.get(path, {
      headers: {
        ...Object.fromEntries(request.headers.entries()),
      },
      params: Object.fromEntries(request.nextUrl.searchParams.entries()),
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const body = await request.json();
    
    const response = await axiosInstance.post(path, body, {
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const body = await request.json();
    
    const response = await axiosInstance.put(path, body, {
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    
    const response = await axiosInstance.delete(path, {
      headers: {
        ...Object.fromEntries(request.headers.entries()),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.response?.status || 500 }
    );
  }
}