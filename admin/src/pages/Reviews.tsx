import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";

const reviews = [
  { id: "REV-01", product: "Luffy Gear Fifth Aura", rating: 5, status: "approved" },
  { id: "REV-02", product: "Kaneki Black Requiem", rating: 4, status: "pending" },
  { id: "REV-03", product: "Kakashi Shadow Ops", rating: 3, status: "reported" },
];

export function ReviewsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <SectionHeader
        title="Reviews"
        subtitle="Moderate ratings and manage community feedback."
      />

      <Card className="mt-6">
        <CardContent className="overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Review</TableHeaderCell>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Rating</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{review.id}</TableCell>
                  <TableCell>{review.product}</TableCell>
                  <TableCell>{review.rating} / 5</TableCell>
                  <TableCell>
                    <Badge variant={review.status === "approved" ? "success" : review.status === "pending" ? "warning" : "danger"}>
                      {review.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
