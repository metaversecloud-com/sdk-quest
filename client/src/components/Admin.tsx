import { useContext, useEffect, useState } from "react";

// components
import { AdminForm, Loading, PlacedItems } from "./index.js";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { ErrorType } from "@/context/types.js";

export const Admin = () => {
  const [questItems, setQuestItems] = useState({});
  const [questItemCount, setQuestItemCount] = useState(0);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // context
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams, questDetails } = useContext(GlobalStateContext);
  const { questItemImage } = questDetails || {};

  useEffect(() => {
    if (hasInteractiveParams) {
      getQuestItems();
    }
  }, [hasInteractiveParams]);

  const getQuestItems = () => {
    backendAPI
      .get("/quest-items")
      .then((response) => {
        setQuestItems(response.data.droppedAssets);
        setQuestItemCount(Object.keys(response.data.droppedAssets).length);
      })
      .catch((error) => setErrorMessage(dispatch, error as ErrorType))
      .finally(() => setIsLoading(false));
  };

  const dropItem = () => {
    setAreButtonsDisabled(true);
    backendAPI
      .post("/drop-quest-item")
      .then(() => getQuestItems())
      .catch((error) => setErrorMessage(dispatch, error as ErrorType))
      .finally(() => setAreButtonsDisabled(false));
  };

  const removeAllQuestItems = () => {
    setAreButtonsDisabled(true);
    backendAPI
      .post("/dropped-asset/remove-all-with-unique-name")
      .then(() => {
        setQuestItems({});
        setQuestItemCount(0);
      })
      .catch((error) => setErrorMessage(dispatch, error as ErrorType))
      .finally(() => setAreButtonsDisabled(false));
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <AdminForm />

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

      {questItemCount > 0 && <PlacedItems questItems={questItems} getQuestItems={getQuestItems} />}
    </>
  );
};
