import { useParams } from "react-router-dom";

const ViewEventById = () => {
  const { eventId } = useParams();

  console.log("Event ID:", eventId);

  return <div>ViewEventById</div>;
};

export default ViewEventById;
