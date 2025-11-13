"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const q = query(collection(db, "todos"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosData: Todo[] = [];
      querySnapshot.forEach((doc) => {
        todosData.push({ id: doc.id, ...doc.data() } as Todo);
      });
      setTodos(todosData);
    });

    return () => unsubscribe();
  }, []);

  const addTodo = async () => {
    if (!newTodo) {
      alert("新しいタスクを入力してください。");
      return;
    }
    try {
      await addDoc(collection(db, "todos"), {
        text: newTodo,
        completed: false,
      });
      setNewTodo("");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("データの登録中にエラーが発生しました。");
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "todos", id));
    } catch (e) {
      console.error("Error deleting document: ", e);
      alert("データの削除中にエラーが発生しました。");
    }
  };

  const toggleComplete = async (todo: Todo) => {
    try {
      await updateDoc(doc(db, "todos", todo.id), {
        completed: !todo.completed,
      });
    } catch (e) {
      console.error("Error updating document: ", e);
      alert("データの更新中にエラーが発生しました。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Todoリスト
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Todoアイテムを追加、表示、削除するためのシンプルなインターフェースです。
            </p>
          </header>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">新しいTodoを追加</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="新しいTodo"
                className="flex-grow px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTodo}
                className="px-6 py-3 text-white bg-blue-600 rounded-lg font-semibold text-lg transition-transform transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                追加
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Todoアイテム</h2>
            {todos.length > 0 ? (
              <ul className="space-y-4">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleComplete(todo)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className={`ml-4 font-medium ${
                          todo.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {todo.text}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors"
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Todoアイテムが見つかりません。</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
