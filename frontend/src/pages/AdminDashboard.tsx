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
import { CheckCircle, XCircle, Filter, Star, Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useNavigate } from 'react-router-dom'
import { useInfo } from '@/hooks/loggedinUser'

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
  approvalStatus: 'APPROVED' | 'DISAPPROVED' | 'PENDING';
  category: string;
  featured: boolean;
}

type FilterStatus = 'ALL' | 'APPROVED' | 'DISAPPROVED' | 'PENDING';

export const AdminDashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [pendingToggles, setPendingToggles] = useState<Record<number, boolean>>({})
  const userId = useInfo();
  const navigate=useNavigate()
  // Fetch all items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get<{ allItems: Item[] }>("http://localhost:3001/api/v1/item/allItems",{
          headers:{
            Authorization:sessionStorage.getItem("jwt"),
          }
        })

        setItems(response.data.allItems)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch items')
        setLoading(false)
      }
    }

    fetchItems()
  }, [])
  useEffect(()=>{
    if(!userId) return;
  const isVerified=async()=>{
    const response=await axios.post("http://localhost:3001/api/v1/user/isVerified",{userId})
    if(!response.data.isVerified){
      navigate("/resendverificationemail")
    }
  }
  isVerified()
  },[userId])
  // Handle item approval
  const handleApprove = async (itemId: number) => {
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      await axios.post(`http://localhost:3001/api/v1/admin/items/${itemId}/approve`, {}, {
        headers: {
          Authorization: sessionStorage.getItem("jwt"),
        }
      })
      
      // Update item status in state
      setItems(prevItems => prevItems.map(item => 
        item.id === itemId 
          ? { ...item, approvalStatus: 'APPROVED' } 
          : item
      ))
    } catch (err) {
      console.error('Approval failed', err)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle item disapproval
  const handleDisapprove = async (itemId: number) => {
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      await axios.post(`http://localhost:3001/api/v1/admin/disapprove/${itemId}`, {}, {
        headers: {
          Authorization: sessionStorage.getItem("jwt"),
        }
      })
      
      // Update item status in state
      setItems(prevItems => prevItems.map(item => 
        item.id === itemId 
          ? { ...item, approvalStatus: 'DISAPPROVED' } 
          : item
      ))
    } catch (err) {
      console.error('Disapproval failed', err)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle toggling featured status
  const handleToggleFeatured = async (itemId: number) => {
    // Skip if this item is already being processed
    if (pendingToggles[itemId] || isUpdating) return
    
    // Mark this specific item as pending
    setPendingToggles(prev => ({ ...prev, [itemId]: true }))
    setIsUpdating(true)
    
    try {
      const item = items.find(item => item.id === itemId)
      if (!item) {
        console.error('Item not found:', itemId)
        return
      }

      // Only approved items can be featured
      if (!item.featured && item.approvalStatus !== 'APPROVED') {
        alert("Only approved items can be featured")
        return
      }

      const newFeaturedStatus = !item.featured
   
      // Make API call with explicit status value
      const response = await axios.post(`http://localhost:3001/api/v1/admin/featured/${itemId}`, {
        featured: newFeaturedStatus
      }, {
        headers: {
          Authorization: sessionStorage.getItem("jwt")
        }
      })
      

      if (response.status === 200) {
      
        setItems(prevItems => prevItems.map(prevItem => 
          prevItem.id === itemId 
            ? { ...prevItem, featured: newFeaturedStatus } 
            : prevItem
        ))
       
      } else {
        console.error('Server returned non-200 status', response)
        alert("Failed to update featured status")
      }
    } catch (err) {
      console.error('Featuring failed', err)
      alert("Failed to update featured status")
    } finally {
      setIsUpdating(false)
      setPendingToggles(prev => ({ ...prev, [itemId]: false }))
    }
  }

  // Filter items based on selected status
  const filteredItems = filterStatus === 'ALL' 
    ? items 
    : items.filter(item => item.approvalStatus === filterStatus)

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <Card className="w-full max-w-6xl mx-auto mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <CardTitle>Items Management</CardTitle>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={() => navigate('/admin/users')}
          >
            <Users className="h-4 w-4" />
            <span>View Users</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as FilterStatus)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Items</SelectItem>
              <SelectItem value="PENDING">Pending Approval</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="DISAPPROVED">Disapproved</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              <TableHead>Approval Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TableRow 
                  key={item.id}
                  className={
                    item.approvalStatus === 'APPROVED' 
                      ? 'bg-green-50 transition-colors duration-500' 
                      : item.approvalStatus === 'DISAPPROVED'
                        ? 'bg-red-50 transition-colors duration-500'
                        : ''
                  }
                >
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
                              className="w-full max-h-96 object-contain" 
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
                  <TableCell>Rs.{item.startingPrice}</TableCell>
                  <TableCell>
                    {format(new Date(item.deadline), 'PPpp')}
                  </TableCell>
                  <TableCell>
                    {item.approvalStatus === 'APPROVED' && (
                      <div className="flex items-center text-green-600 font-medium">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approved
                      </div>
                    )}
                    {item.approvalStatus === 'DISAPPROVED' && (
                      <div className="flex items-center text-red-600 font-medium">
                        <XCircle className="mr-1 h-4 w-4" />
                        Disapproved
                      </div>
                    )}
                    {item.approvalStatus === 'PENDING' && (
                      <Badge variant="outline" className="bg-yellow-50">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.featured}
                        onCheckedChange={() => {
                          if (!pendingToggles[item.id] && !isUpdating) {
                            handleToggleFeatured(item.id)
                          }
                        }}
                        disabled={item.approvalStatus !== 'APPROVED' || pendingToggles[item.id] || isUpdating}
                        data-item-id={item.id}
                      />
                      {item.featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.approvalStatus === 'PENDING' ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleApprove(item.id)}
                          disabled={isUpdating}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleDisapprove(item.id)}
                          disabled={isUpdating}
                        >
                          Disapprove
                        </Button>
                      </div>
                    ) : (
                      <Badge 
                        className={
                          item.approvalStatus === 'APPROVED' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {item.approvalStatus === 'APPROVED' ? 'Item Approved' : 'Item Disapproved'}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  {filterStatus === 'ALL' 
                    ? 'No items found' 
                    : `No ${filterStatus.toLowerCase()} items found`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default AdminDashboard;