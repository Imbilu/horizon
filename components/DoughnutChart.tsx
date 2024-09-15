"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
ChartJS.register(ArcElement, Tooltip, Legend);

function DoughnutChart({ accounts }: DoughnutChartProps) {
    const data = {
        datasets: [
            {
                label: "Banks",
                data: [100, 1200, 300],
                backgroundColor: ["#0747b6", "#2265d8", "#2f91fa"],
            },
        ],
        labels: ["bank1", "bank2", "bank3"],
    };
    return (
        <Doughnut
            data={data}
            options={{
                cutout: "60%",
                plugins: {
                    legend: { display: false },
                },
            }}
        />
    );
}

export default DoughnutChart;
