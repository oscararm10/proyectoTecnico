import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.DDB_TABLE!;
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export async function putHistory(item: any) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
}

export async function putCache(key: string, payload: any) {
  const now = Date.now();
  const ttlSeconds = Math.floor((now + 31 * 60 * 1000) / 1000);
  const item = {
    pk: `CACHE#${key}`,
    sk: `#${now}`,
    cachedAt: new Date(now).toISOString(),
    data: payload.data || payload,
    ttl: ttlSeconds
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
}

export async function getCache(key: string) {
  const pk = `CACHE#${key}`;
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": pk },
      ScanIndexForward: false,
      Limit: 1
    })
  );
  if (!res.Items || res.Items.length === 0) return null;
  const item = res.Items[0];
  return { cachedAt: item.cachedAt, data: item.data };
}

export async function saveCustom(data: any) {
  const now = new Date().toISOString();
  const item = { pk: "CUSTOM", sk: `#${now}`, data, createdAt: now };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

export async function getHistory({ page, pageSize }: { page: number; pageSize: number }) {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": "FUSION" },
      ScanIndexForward: false,
      Limit: pageSize
    })
  );
  return { items: res.Items || [], page, pageSize };
}
