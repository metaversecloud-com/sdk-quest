import { backendAPI } from "@utils/backendAPI";

export function PlacedItems({ droppedItems, getQuestItems, setErrorMessage }) {

  const removeQuestItem = async (id) => {
    setErrorMessage("");
    backendAPI.delete(`/dropped-asset/${id}`)
      .then(() => getQuestItems())
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
  };

  const moveVisitor = async (position) => {
    setErrorMessage("");
    backendAPI.put("/visitor/move", { moveTo: position })
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
  };

  return (
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
  );
}
