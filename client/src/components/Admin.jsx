import React, { useContext, useEffect, useState } from "react";

// components
import { Loading } from "@components/Loading";

// utils
import { backendAPI } from "@utils/backendAPI";

// context
import { GlobalStateContext } from "@context/GlobalContext";

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
      setIsLoading(false);
    }
  }, [hasInteractiveParams]);

  const getDataObject = async () => {
    try {
      const result = await backendAPI.get("/dropped-asset/data-object");
      const dataObject = result.data.droppedAsset.dataObject;
      if (dataObject.numberAllowedToCollect) setNumberAllowedToCollect(dataObject.numberAllowedToCollect);
      if (dataObject.questItemImage) setQuestItemImage(dataObject.questItemImage);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const getQuestItems = async () => {
    try {
      const result = await backendAPI.get("/quest-items");
      setQuestItems(result.data.droppedAssets);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const dropItem = async () => {
    try {
      setAreButtonsDisabled(true);
      await backendAPI.post("/drop-quest-item");
      getQuestItems();
      setAreButtonsDisabled(false);
      setErrorMessage("");
    } catch (error) {
      setAreButtonsDisabled(false);
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const removeAllQuestItems = async () => {
    try {
      setAreButtonsDisabled(true);
      await backendAPI.post("/dropped-asset/remove-all-with-unique-name");
      setQuestItems([]);
      setAreButtonsDisabled(false);
      setErrorMessage("");
    } catch (error) {
      setAreButtonsDisabled(false);
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const removeQuestItem = async (id) => {
    try {
      await backendAPI.delete(`/dropped-asset/${id}`);
      getQuestItems();
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const moveVisitor = async (position) => {
    try {
      await backendAPI.put("/visitor/move", { moveTo: position });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const saveAdminUpdates = async () => {
    setAreButtonsDisabled(true);
    try {
      await backendAPI.post("/admin-settings", { numberAllowedToCollect, questItemImage });
      dispatch({
        type: "SET_KEY_ASSET_IMAGE",
        payload: { keyAssetImage: questItemImage },
      });
      setAreButtonsDisabled(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message);
      setAreButtonsDisabled(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="container grid gap-4">
        <hr />
        <div className="mt-4">
          <label htmlFor="numberAllowedToCollect">Number Allowed To Collect Per Day:</label>
          <input
            className="input"
            id="numberAllowedToCollect"
            onChange={(e) => setNumberAllowedToCollect(e.target.value)}
            type="text"
            value={numberAllowedToCollect}
          />
        </div>

        <div>
          <label htmlFor="questItemImage">Quest Item Image URL:</label>
          <input
            className="input"
            id="questItemImage"
            onChange={(e) => setQuestItemImage(e.target.value)}
            type="text"
            value={questItemImage}
          />
          <p className="p3">Update image for all Quest Items in world. This will not change the Key Asset image.</p>
        </div>

        <button className="btn mt-2" disabled={areButtonsDisabled} onClick={saveAdminUpdates}>
          Save
        </button>
        <hr style={{ margin: 1 }} />
      </div>
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
            Remove all
          </button>
        </div>
      </div>

      {droppedItems.length > 0 && (
        <div className="container mt-4">
          <h4>Placed Items</h4>
          <table className="table">
            <tbody>
              {droppedItems.map((item, index) => {
                if (!item) return <div />;
                let lastMovedFormatted = "-";
                if (item.clickableLink) {
                  const clickableLink = new URL(item.clickableLink);
                  let params = new URLSearchParams(clickableLink.search);
                  const lastMoved = new Date(parseInt(params.get("lastMoved")));
                  const now = new Date()
                  lastMovedFormatted = Math.round((now - lastMoved) / (1000 * 60 * 60 * 24));
                }
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="tooltip">
                        <span className="tooltip-content">Last Moved</span>
                        <p className="p3">
                          {lastMovedFormatted === 0 ? "Today" : `${lastMovedFormatted} day${lastMovedFormatted > 1 ? 's' : ''} ago`}
                        </p>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="tooltip">
                        <span className="tooltip-content">Walk to Item</span>
                        <button className="btn btn-icon" onClick={() => moveVisitor(item.position)}>
                          <img alt="Walk to" src="https://sdk-style.s3.amazonaws.com/icons/walk.svg" />
                        </button>
                      </div>
                      <div className="tooltip">
                        <span className="tooltip-content">Remove Item</span>
                        <button className="btn btn-icon" onClick={() => removeQuestItem(item.id)}>
                          <img alt="Remove" src="https://sdk-style.s3.amazonaws.com/icons/delete.svg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {errorMessage && <p className="p3 text-error">{errorMessage}</p>}
    </>
  );
}
