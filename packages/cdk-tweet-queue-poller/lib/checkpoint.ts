import { DynamoDB, AWSError } from 'aws-sdk';
import { getEnv } from './util';

export interface CheckpointTableOptions {
  /**
   * DynamoDB client.
   * @default The default client
   **/
  dynamodb?: DynamoDB;

  /**
   * Table name.
   * @default value of CHECKPOINT_TABLE_NAME environment variable
   */
  tableName?: string;

  /**
   * Name of primary key.
   * @default value of the CHECKPOINT_TABLE_KEY_NAME environment variable
   */
  keyName?: string;
}

export class CheckpointTable {
  private readonly dynamodb: DynamoDB;
  private readonly tableName: string;
  private readonly keyName: string;

  constructor(options: CheckpointTableOptions = {}) {
    this.dynamodb = options.dynamodb || new DynamoDB();
    this.tableName = options.tableName || getEnv('CHECKPOINT_TABLE_NAME');
    this.keyName = options.keyName || getEnv('CHECKPOINT_TABLE_KEY_NAME');
  }

  public async getLastCheckpoint(): Promise<undefined | string> {
    const req: DynamoDB.GetItemInput = {
      TableName: this.tableName,
      Key: {
        [this.keyName]: { S: 'max_id' }
      }
    };

    const response = await this.dynamodb.getItem(req).promise();
    if (!response.Item) {
      console.error('no max_id stored in database yet')
      return undefined; // not found
    }

    return response.Item.max_id.N!;
  }

  public async checkpoint(id: string) {
    const req: DynamoDB.PutItemInput = {
      TableName: this.tableName,
      Item: {
        [this.keyName]: { S: 'max_id' },
        max_id: { N: id.toString() }
      }
    };

    await this.dynamodb.putItem(req).promise();
  }
}