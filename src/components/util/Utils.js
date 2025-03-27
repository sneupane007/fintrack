import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

export const getExpenses = async () => {
  const expenseCollection = collection(db, "expense");
  try {
    const data = await getDocs(expenseCollection);
    const filteredData = data.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return filteredData;
  } catch (error) {
    console.error("Error fetching expenses: ", error);
  }
};
export const getIncome = async () => {
  const expenseCollection = collection(db, "income");
  try {
    const data = await getDocs(expenseCollection);
    const filteredData = data.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return filteredData;
  } catch (error) {
    console.error("Error fetching expenses: ", error);
  }
};
