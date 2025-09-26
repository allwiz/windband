/**
 * S3-Compatible Storage Configuration for Supabase Storage
 * This configuration enables direct S3 API access to the storage bucket
 */

export const s3Config = {
  // S3-Compatible endpoint for Supabase Storage
  endpoint: import.meta.env.VITE_STORAGE_ENDPOINT || '',

  // AWS region (Supabase uses us-west-1)
  region: import.meta.env.VITE_STORAGE_REGION || 'us-west-1',

  // S3 Access credentials
  accessKeyId: import.meta.env.VITE_STORAGE_ACCESS_KEY || '',
  secretAccessKey: import.meta.env.VITE_STORAGE_SECRET_KEY || '',

  // Bucket configuration
  bucketName: import.meta.env.VITE_STORAGE_BUCKET_NAME || 'gmwb_public',

  // S3 API version
  apiVersion: '2006-03-01',

  // Force path-style addressing for compatibility
  s3ForcePathStyle: true,

  // Signature version
  signatureVersion: 'v4'
}

/**
 * Check if S3 configuration is available
 * @returns {boolean} True if all required S3 config values are present
 */
export const hasS3Config = () => {
  return !!(
    s3Config.endpoint &&
    s3Config.accessKeyId &&
    s3Config.secretAccessKey &&
    s3Config.bucketName
  )
}

/**
 * Get the full S3 URL for a file
 * @param {string} filePath - Path to the file in the bucket
 * @returns {string} Full URL to the file
 */
export const getS3FileUrl = (filePath) => {
  if (!filePath) return ''

  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath

  // If using Supabase's standard storage, construct the public URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${s3Config.bucketName}/${cleanPath}`
  }

  // Fallback to S3 endpoint URL
  const endpoint = s3Config.endpoint.replace('/storage/v1/s3', '')
  return `${endpoint}/storage/v1/object/public/${s3Config.bucketName}/${cleanPath}`
}

/**
 * Validate S3 configuration
 * @throws {Error} If configuration is invalid
 */
export const validateS3Config = () => {
  const required = ['endpoint', 'accessKeyId', 'secretAccessKey', 'bucketName', 'region']
  const missing = []

  for (const field of required) {
    if (!s3Config[field]) {
      missing.push(field)
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required S3 configuration: ${missing.join(', ')}. Please check your .env file.`)
  }

  // Validate endpoint format
  if (!s3Config.endpoint.includes('storage.supabase.co')) {
    console.warn('S3 endpoint does not appear to be a Supabase storage endpoint')
  }

  return true
}

/**
 * Get S3 client configuration object
 * Can be used with AWS SDK or S3-compatible clients
 * @returns {object} S3 client configuration
 */
export const getS3ClientConfig = () => {
  return {
    endpoint: s3Config.endpoint,
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey
    },
    forcePathStyle: s3Config.s3ForcePathStyle,
    signatureVersion: s3Config.signatureVersion
  }
}

export default s3Config