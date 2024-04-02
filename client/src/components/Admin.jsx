import React, { useContext, useEffect, useState } from "react";

// components
import { Loading } from "@components/Loading";

// utils
import { backendAPI } from "@utils/backendAPI";

// context
import { GlobalStateContext } from "@context/GlobalContext";
import { PlacedItems } from './PlacedItems';
import { AdminForm } from './AdminForm';

export function Admin({ keyAssetImage }) {
  const [numberAllowedToCollect, setNumberAllowedToCollect] = useState();
  const [questItemImage, setQuestItemImage] = useState("");
  const [droppedItems, setQuestItems] = useState([]);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // context
  const { hasInteractiveParams } = useContext(GlobalStateContext);

  useEffect(() => {
    if (hasInteractiveParams) {
      getDataObject();
      getQuestItems();
    }
  }, [hasInteractiveParams]);

  const getDataObject = async () => {
    setErrorMessage("");
    backendAPI.get("/dropped-asset/data-object")
      .then((result) => {
        const dataObject = result.data.droppedAsset.dataObject;
        if (dataObject.numberAllowedToCollect) setNumberAllowedToCollect(dataObject.numberAllowedToCollect);
        if (dataObject.questItemImage) setQuestItemImage(dataObject.questItemImage);
      })
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => setIsLoading(false))
  };

  const getQuestItems = async () => {
    setErrorMessage("");
    backendAPI.get("/quest-items")
      .then((result) => setQuestItems(result.data.droppedAssets))
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
  };

  const dropItem = async () => {
    setErrorMessage("");
    setAreButtonsDisabled(true);
    backendAPI.post("/drop-quest-item")
      .then(() => getQuestItems())
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => setAreButtonsDisabled(false))
  };

  const removeAllQuestItems = async () => {
    setErrorMessage("");
    setAreButtonsDisabled(true);
    backendAPI.post("/dropped-asset/remove-all-with-unique-name")
      .then(() => setQuestItems([]))
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => setAreButtonsDisabled(false))
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <AdminForm numberAllowedToCollect={numberAllowedToCollect} questItemImage={questItemImage} setErrorMessage={setErrorMessage} setNumberAllowedToCollect={setNumberAllowedToCollect} setQuestItemImage={setQuestItemImage} />
      <div className="container py-6 items-center justify-center">
        <h5 className="h5 flex items-center justify-center pb-4">
          {droppedItems.length}{" "}
          {keyAssetImage && (
            <img alt="Drop in world" src={keyAssetImage} style={{ height: 20, paddingLeft: 4, paddingRight: 4 }} />
          )}{" "}
            hidden in this world
          </h5>
        <div className="my-2">
          <button className="btn" disabled={areButtonsDisabled} onClick={dropItem}>
            Hide
            {keyAssetImage && (
              <img alt="Drop in world" src={keyAssetImage} style={{ height: 20, paddingLeft: 4, paddingRight: 4 }} />
            )}{" "}
            in world
          </button>
        </div>
        <div className="flex flex-col">
          <button
            className="btn btn-outline"
            disabled={areButtonsDisabled || droppedItems.length === 0}
            onClick={removeAllQuestItems}
          >
            Remove all items
          </button>
        </div>
      </div>

      {droppedItems.length > 0 && <PlacedItems droppedItems={droppedItems} getQuestItems={getQuestItems} setErrorMessage={setErrorMessage} />}

      {errorMessage && <p className="p3 text-error">{errorMessage}</p>}
    </>
  );
}
