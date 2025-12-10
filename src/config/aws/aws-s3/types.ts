export interface PolicyToBucketI {
  bucketName: string;
  policy: {
    Version: string;
    Statement: {
      Sid: string;
      Effect: string;
      Principal: object;
      Action: string;
      Resource: string;
    }[];
  };
}

export interface GetObjectI {
  buckectName: string;
  key: string;
}
