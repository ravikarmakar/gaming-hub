import useAuthStore from "@/store/useAuthStore";

const Dashboard = () => {
  const { user } = useAuthStore();

  console.log(user);

  return <h1>Welcome to dashboard</h1>;
};

export default Dashboard;
