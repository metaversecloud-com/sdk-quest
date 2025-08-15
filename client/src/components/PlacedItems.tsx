import { useContext } from "react";

// context
import { ErrorType } from "@/context/types";
import { GlobalDispatchContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

export const PlacedItems = ({
  getQuestItems,
  questItems,
}: {
  getQuestItems: () => void;
  questItems: { [key: string]: { id: string; clickableLink: string; position: { x: number; y: number } } };
}) => {
  const dispatch = useContext(GlobalDispatchContext);

  const removeQuestItem = async (id: string) => {
    backendAPI
      .delete(`/dropped-asset/${id}`)
      .then(() => getQuestItems())
      .catch((error) => setErrorMessage(dispatch, error as ErrorType));
  };

  const moveVisitor = async (position: { x: number; y: number }) => {
    backendAPI
      .put("/visitor/move", { moveTo: position })
      .catch((error) => setErrorMessage(dispatch, error as ErrorType));
  };

  return (
    <div className="container mt-4">
      <h4>Placed Items</h4>
      <table className="table">
        <tbody>
          {Object.keys(questItems).map((key, index) => {
            const item = questItems[key];
            if (!item) return <div />;
            let lastMovedFormatted = 0;
            if (item.clickableLink) {
              const clickableLink = new URL(item.clickableLink);
              const params = new URLSearchParams(clickableLink.search);
              const lastMovedParam = params.get("lastMoved");
              const now = new Date();
              const lastMoved = lastMovedParam ? new Date(parseInt(lastMovedParam)) : now;
              lastMovedFormatted = Math.round((now.getTime() - lastMoved.getTime()) / (1000 * 60 * 60 * 24));
            }
            return (
              <tr key={index}>
                <td className="p3">{index + 1}</td>
                <td>
                  <div className="tooltip">
                    <span className="tooltip-content">Last Moved</span>
                    <p className="p3">
                      {lastMovedFormatted === 0
                        ? "Today"
                        : `${lastMovedFormatted} day${lastMovedFormatted > 1 ? "s" : ""} ago`}
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
  );
};
