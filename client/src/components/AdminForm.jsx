import React, { useState } from "react";

// utils
import { backendAPI } from "@utils/backendAPI";

export function AdminForm({ numberAllowedToCollect, questItemImage, setErrorMessage, setNumberAllowedToCollect, setQuestItemImage }) {
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const saveAdminUpdates = async () => {
    setAreButtonsDisabled(true);
    setErrorMessage("");
    backendAPI.post("/admin-settings", { numberAllowedToCollect, questItemImage })
      .then(() => {
        dispatch({
          type: "SET_KEY_ASSET_IMAGE",
          payload: { keyAssetImage: questItemImage },
        });
      })
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => setAreButtonsDisabled(false))
  };

  const removeQuest = async () => {
    setErrorMessage("");
    setAreButtonsDisabled(true);
    backendAPI.delete("/quest")
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => setAreButtonsDisabled(false))
  };

  return (
    <div className="container grid gap-2">
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
      <button className="btn btn-danger" disabled={areButtonsDisabled} onClick={() => setShowModal(true)}>
        Remove Quest from world
      </button>
      <hr className="mt-4 mb-2" />

      {showModal && (
        <div className="modal-container">
          <div className="modal">
            <h4 className="h4">Remove Quest from World</h4>
            <p className="p2">
              This will remove this Quest and all associated data permanently. Are you sure you'd like to continue?
            </p>
            <div className="actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button className="btn btn-danger" onClick={removeQuest}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
