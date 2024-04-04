import { useContext, useEffect, useState } from "react";

// components
import { AdminForm, Loading, PlacedItems } from "./index.js";

// utils
import { backendAPI } from "@utils/backendAPI";

// context
import { GlobalStateContext } from "@context/GlobalContext";

export const Admin = () => {
  const [questItems, setQuestItems] = useState({});
  const [questItemCount, setQuestItemCount] = useState(0);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // context
  const { hasInteractiveParams, questDetails } = useContext(GlobalStateContext);
  const { questItemImage } = questDetails

  useEffect(() => {
    if (hasInteractiveParams) {
      getQuestItems();
    }
  }, [hasInteractiveParams]);

  const getQuestItems = () => {
    setErrorMessage("");
    backendAPI.get("/quest-items")
      .then((result) => {
        setQuestItems(result.data.droppedAssets)
        setQuestItemCount(Object.keys(result.data.droppedAssets).length)
      })
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => setIsLoading(false))
  };

  const dropItem = () => {
    setErrorMessage("");
    setAreButtonsDisabled(true);
    backendAPI.post("/drop-quest-item")
      .then(() => getQuestItems())
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => setAreButtonsDisabled(false))
  };

  const removeAllQuestItems = () => {
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
      <AdminForm setErrorMessage={setErrorMessage} />

      <div className="container py-6 items-center justify-center">
        <h5 className="h5 flex items-center justify-center pb-4">
          {questItemCount}{" "}
          {questItemImage && (
            <img alt="Drop in world" src={questItemImage} style={{ height: 20, paddingLeft: 4, paddingRight: 4 }} />
          )}{" "}
            hidden in this world
          </h5>
        <div className="my-2">
          <button className="btn" disabled={areButtonsDisabled} onClick={dropItem}>
            Hide
            {questItemImage && (
              <img alt="Drop in world" src={questItemImage} style={{ height: 20, paddingLeft: 4, paddingRight: 4 }} />
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

      {errorMessage && <p className="p3 text-error">{`${errorMessage}`}</p>}
    </>
  );
}
