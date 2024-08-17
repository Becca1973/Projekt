// RechartsChart.js
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const RechartsChart = ({ facebookPost, instagramPost }) => {
  const extractData = (post) => {
    if (!post) {
      return { likes: 0, comments: 0 };
    }
    if (post.message) {
      return {
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
      };
    } else if (post.caption) {
      return {
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
      };
    }
    return { likes: 0, comments: 0 };
  };

  const facebookData = facebookPost ? extractData(facebookPost) : null;
  const instagramData = instagramPost ? extractData(instagramPost) : null;

  const barData = [];
  if (facebookData) {
    barData.push(
      { name: "Facebook Likes", value: facebookData.likes },
      { name: "Facebook Comments", value: facebookData.comments }
    );
  }
  if (instagramData) {
    barData.push(
      { name: "Instagram Likes", value: instagramData.likes },
      { name: "Instagram Comments", value: instagramData.comments }
    );
  }

  const pieLikesData = [];
  const pieCommentsData = [];

  if (facebookData) {
    pieLikesData.push({ name: "Facebook", value: facebookData.likes });
    pieCommentsData.push({ name: "Facebook", value: facebookData.comments });
  }
  if (instagramData) {
    pieLikesData.push({ name: "Instagram", value: instagramData.likes });
    pieCommentsData.push({ name: "Instagram", value: instagramData.comments });
  }

  const COLORS = ["#3b5998", "#E1306C"];

  const renderCustomizedLabel = ({ name, value, percent }) => {
    return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <div>
      <h2>Social Media Metrics</h2>

      {barData.length > 0 && (
        <BarChart width={600} height={300} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      )}

      {pieLikesData.length > 0 && (
        <>
          <h3>Likes Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={pieLikesData}
              cx={200}
              cy={150}
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieLikesData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </>
      )}

      {pieCommentsData.length > 0 && (
        <>
          <h3>Comments Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={pieCommentsData}
              cx={200}
              cy={150}
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#82ca9d"
              dataKey="value"
            >
              {pieCommentsData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </>
      )}
    </div>
  );
};

export default RechartsChart;
