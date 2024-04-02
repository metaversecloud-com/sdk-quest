import React, { useContext, useEffect, useState } from "react";

// components
import { AdminForm, Loading, PlacedItems } from "@components";

// utils
import { backendAPI } from "@utils/backendAPI";

// context
import { GlobalStateContext } from "@context/GlobalContext";

export function Admin({ keyAssetImage }) {
  const [numberAllowedToCollect, setNumberAllowedToCollect] = useState();
  const [questItemImage, setQuestItemImage] = useState("");
  const [questItems, setQuestItems] = useState({});
  const [questItemCount, setQuestItemCount] = useState(0);
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
      .then((result) => {
        setQuestItems(result.data.droppedAssets)
        setQuestItemCount(Object.keys(result.data.droppedAssets).length)
      })
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
      .then(() => {
        setQuestItems({})
        setQuestItemCount(0)
      })
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => setAreButtonsDisabled(false))
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <AdminForm numberAllowedToCollect={numberAllowedToCollect} questItemImage={questItemImage} setErrorMessage={setErrorMessage} setNumberAllowedToCollect={setNumberAllowedToCollect} setQuestItemImage={setQuestItemImage} />

      <div className="container py-6 items-center justify-center">
        <h5 className="h5 flex items-center justify-center pb-4">
          {questItemCount}{" "}
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
            disabled={areButtonsDisabled || questItemCount === 0}
            onClick={removeAllQuestItems}
          >
            Remove all items
          </button>
        </div>
      </div>

      {questItemCount > 0 && <PlacedItems questItems={questItems} getQuestItems={getQuestItems} setErrorMessage={setErrorMessage} />}

      {errorMessage && <p className="p3 text-error">{errorMessage}</p>}
    </>
  );
}
