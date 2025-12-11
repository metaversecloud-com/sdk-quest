import { Credentials } from "../types";
import { standardizedError } from "./standardizedError";
import { Ecosystem } from "./topiaInit";

export const grantBadge = async ({
  credentials,
  visitor,
  visitorInventory,
  badgeName,
}: {
  credentials: Credentials;
  visitor: any;
  visitorInventory: any;
  badgeName: string;
}) => {
  try {
    if (visitorInventory[badgeName]) return { success: true };

    const ecosystem = await Ecosystem.create({ credentials });
    await ecosystem.fetchInventoryItems();

    const inventoryItem = ecosystem.inventoryItems?.find((item) => item.name === badgeName);
    if (!inventoryItem) throw new Error(`Inventory item ${badgeName} not found in ecosystem`);

    await visitor.grantInventoryItem(inventoryItem, 1);

    return { success: true };
  } catch (error: any) {
    return standardizedError(error);
  }
};
