import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'

// Type definition for the item
interface Item {
  id: number;
  startingPrice: number;
  name: string;
  description: string;
  deadline: string;
  photo: string;
  userId: number;
  status: 'PENDING' | 'SOLD' | 'UNSOLD';
  isApproved: boolean;
  category: string;
}

export const AdminDashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch unapproved items
  useEffect(() => {
    const fetchUnapprovedItems = async () => {
      try {
        const response = await axios.get<{ items: Item[] }>("http://localhost:3001/api/v1/admin/unapproveditems")
        setItems(response.data.items)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch items')
        setLoading(false)
      }
    }

    fetchUnapprovedItems()
  }, [])

  // Handle item approval
  const handleApprove = async (itemId: number) => {
    try {
      await axios.get(`http://localhost:3001/api/v1/admin/items/${itemId}`)
      setItems(items.filter(item => item.id !== itemId))
    } catch (err) {
      console.error('Approval failed', err)
    }
  }

  // Handle item disapproval
  const handleDisapprove = async (itemId: number) => {
    try {
      await axios.post(`http://localhost:3001/api/v1/admin/items/${itemId}/disapprove`)
      // Remove the item from the list after disapproval
      setItems(items.filter(item => item.id !== itemId))
    } catch (err) {
      console.error('Disapproval failed', err)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <Card className="w-full max-w-6xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Unapproved Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Starting Price</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Dialog>
                    <DialogTrigger>
                      <img 
                        src={item.photo} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-md cursor-pointer" 
                      />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{item.name}</DialogTitle>
                        <DialogDescription>
                          <img 
                            src={item.photo} 
                            alt={item.name} 
                            className="w-full max-h-[500px] object-contain" 
                          />
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category}</Badge>
                </TableCell>
                <TableCell>${item.startingPrice}</TableCell>
                <TableCell>
                  {format(new Date(item.deadline), 'PPpp')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleApprove(item.id)}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleDisapprove(item.id)}
                    >
                      Disapprove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {items.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No unapproved items
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminDashboard