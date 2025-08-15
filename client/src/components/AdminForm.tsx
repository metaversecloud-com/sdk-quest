import { useContext, useState } from "react";
import { useForm } from "react-hook-form";

// context
import { GlobalStateContext } from "@context/GlobalContext";
import { GlobalDispatchContext } from "@context/GlobalContext";
import { ErrorType, SET_QUEST_DETAILS } from "@/context/types";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

export const AdminForm = () => {
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // context
  const { questDetails } = useContext(GlobalStateContext);
  const { numberAllowedToCollect, questItemImage } = questDetails || {};
  const dispatch = useContext(GlobalDispatchContext);

  const { handleSubmit, register } = useForm();

  const onSubmit = handleSubmit((data) => {
    const { numberAllowedToCollect, questItemImage } = data;
    setAreButtonsDisabled(true);
    backendAPI
      .post("/admin-settings", { numberAllowedToCollect, questItemImage })
      .then((response) => {
        dispatch!({
          type: SET_QUEST_DETAILS,
          payload: { questDetails: response.data.questDetails },
        });
      })
      .catch((error) => setErrorMessage(dispatch, error as ErrorType))
      .finally(() => setAreButtonsDisabled(false));
  });

  const removeQuest = () => {
    setAreButtonsDisabled(true);
    setIsLoading(true);
    backendAPI
      .delete("/quest")
      .catch((error) => setErrorMessage(dispatch, error as ErrorType))
      .finally(() => {
        setAreButtonsDisabled(false);
        setIsLoading(false);
        setShowModal(false);
      });
  };

  return (
    <div className="grid gap-2">
      <hr />
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="mt-4">
          <label htmlFor="numberAllowedToCollect">Number Allowed To Collect Per Day:</label>
          <input
            className="input"
            {...register("numberAllowedToCollect", { required: true, value: numberAllowedToCollect })}
          />
        </div>

        <div>
          <label htmlFor="questItemImage">Quest Item Image URL:</label>
          <input className="input" {...register("questItemImage", { required: true, value: questItemImage })} />
          <p className="p3">Update image for all Quest Items in world. This will not change the Key Asset image.</p>
        </div>

        <div>
          <button className="btn mb-2" disabled={areButtonsDisabled} type="submit">
            Save
          </button>
          <button className="btn btn-danger" disabled={areButtonsDisabled} onClick={() => setShowModal(true)}>
            Remove Quest from world
          </button>
        </div>
      </form>
      <hr className="mt-4 mb-2" />

      {showModal && (
        <div className="modal-container">
          <div className="modal">
            <h4 className="h4">Remove Quest from World</h4>
            <p className="p2">
              This will remove this Quest and all associated data permanently. Are you sure you'd like to continue?
            </p>
            <div className="actions">
              <button disabled={isLoading} className="btn btn-outline" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button disabled={isLoading} className="btn btn-danger" onClick={removeQuest}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
